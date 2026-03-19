/**
 * AWS KMS Signer for Hedera Transactions
 *
 * Enables enterprise-grade key management: the operator private key lives
 * inside AWS Key Management Service (KMS) and never leaves the HSM boundary.
 * Transactions are signed by KMS on demand, rather than using a plaintext
 * private key in the environment.
 *
 * Key type required in KMS: ECC_SECG_P256K1 (secp256k1)
 * Signing algorithm:        ECDSA_SHA_256
 *
 * Setup:
 *   1. Create an asymmetric KMS key with key spec ECC_SECG_P256K1
 *   2. Set AWS_KMS_KEY_ID, AWS_REGION in server/.env
 *   3. Set AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY  -OR-  attach an IAM role
 *      that grants kms:Sign + kms:GetPublicKey to the running process.
 *   4. Leave HEDERA_PRIVATE_KEY blank — KMS takes over.
 *
 * See: https://docs.aws.amazon.com/kms/latest/developerguide/asymmetric-key-specs.html
 */
import {
  KMSClient,
  SignCommand,
  GetPublicKeyCommand,
  type SignCommandInput,
} from "@aws-sdk/client-kms";
import { PublicKey } from "@hashgraph/sdk";
import { env } from "../lib/env.js";

export interface KmsSigner {
  hederaPublicKey: PublicKey;
  /** Sign arbitrary bytes. Returns raw 64-byte r+s ECDSA signature. */
  sign: (bytes: Uint8Array) => Promise<Uint8Array>;
}

class AwsKmsService {
  private client: KMSClient | null = null;
  private signerCache: Map<string, KmsSigner> = new Map();

  isConfigured(): boolean {
    return !!(env.AWS_KMS_KEY_ID && env.AWS_REGION);
  }

  async getSigner(keyId: string): Promise<KmsSigner> {
    const cached = this.signerCache.get(keyId);
    if (cached) return cached;

    const kms = this.getKmsClient();

    // Retrieve public key from KMS (SPKI DER-encoded)
    const pkResponse = await kms.send(new GetPublicKeyCommand({ KeyId: keyId }));
    if (!pkResponse.PublicKey) {
      throw new Error(`KMS did not return a public key for key ${keyId}`);
    }

    const hederaPublicKey = this.spkiToHederaPublicKey(
      pkResponse.PublicKey as Uint8Array,
    );

    const sign = async (bytes: Uint8Array): Promise<Uint8Array> => {
      const params: SignCommandInput = {
        KeyId: keyId,
        Message: bytes,
        MessageType: "RAW",
        SigningAlgorithm: "ECDSA_SHA_256",
      };
      const sigResponse = await kms.send(new SignCommand(params));
      if (!sigResponse.Signature) {
        throw new Error(`KMS sign returned no Signature for key ${keyId}`);
      }
      return this.derToRaw(sigResponse.Signature as Uint8Array);
    };

    const signer: KmsSigner = { hederaPublicKey, sign };
    this.signerCache.set(keyId, signer);
    return signer;
  }

  /**
   * Convert an AWS KMS SPKI-encoded secp256k1 public key (88 bytes) to a
   * Hedera PublicKey (compressed 33-byte ECDSA format).
   *
   * SPKI structure for ECC_SECG_P256K1 (88 bytes total):
   *   30 56         outer SEQUENCE
   *     30 10       algorithm SEQUENCE
   *       06 07 ...   id-ecPublicKey OID
   *       06 05 ...   secp256k1 OID
   *     03 42       BIT STRING (66 bytes)
   *       00        no unused bits
   *       04 [32 x] [32 y]  uncompressed EC point
   */
  private spkiToHederaPublicKey(spki: Uint8Array): PublicKey {
    // The uncompressed point (0x04 || x || y) starts at byte 23
    if (spki.length < 88) {
      throw new Error(`Unexpected SPKI length ${spki.length}, expected 88 for secp256k1`);
    }
    const pointByte = spki[23];
    if (pointByte !== 0x04) {
      throw new Error(`Expected uncompressed EC point (0x04) at offset 23, got 0x${pointByte.toString(16)}`);
    }

    const x = spki.slice(24, 56);  // 32 bytes
    const y = spki.slice(56, 88);  // 32 bytes

    // Compress: even y → 0x02, odd y → 0x03
    const prefix = y[y.length - 1] % 2 === 0 ? 0x02 : 0x03;
    const compressed = new Uint8Array(33);
    compressed[0] = prefix;
    compressed.set(x, 1);

    return PublicKey.fromBytesECDSA(compressed);
  }

  /**
   * Convert DER-encoded ECDSA signature (AWS KMS output) to raw 64-byte r+s.
   *
   * DER structure:
   *   30 <seq_len>
   *     02 <r_len> <r>
   *     02 <s_len> <s>
   */
  private derToRaw(der: Uint8Array): Uint8Array {
    if (der[0] !== 0x30) {
      throw new Error("DER signature must start with 0x30 (SEQUENCE)");
    }

    let offset = 2; // skip 0x30 and sequence length byte

    if (der[offset] !== 0x02) {
      throw new Error(`Expected INTEGER tag (0x02) at offset ${offset}`);
    }
    const rLen = der[offset + 1];
    const r = der.slice(offset + 2, offset + 2 + rLen);
    offset += 2 + rLen;

    if (der[offset] !== 0x02) {
      throw new Error(`Expected INTEGER tag (0x02) at offset ${offset}`);
    }
    const sLen = der[offset + 1];
    const s = der.slice(offset + 2, offset + 2 + sLen);

    const result = new Uint8Array(64);
    result.set(this.normalizeTo32(r), 0);
    result.set(this.normalizeTo32(s), 32);
    return result;
  }

  /** Strip DER INTEGER leading 0x00 padding, then left-pad to 32 bytes. */
  private normalizeTo32(bytes: Uint8Array): Uint8Array {
    let start = 0;
    while (start < bytes.length - 1 && bytes[start] === 0x00) {
      start++;
    }
    const stripped = bytes.slice(start);
    if (stripped.length > 32) {
      throw new Error(`Normalized integer exceeds 32 bytes (${stripped.length})`);
    }
    const padded = new Uint8Array(32);
    padded.set(stripped, 32 - stripped.length);
    return padded;
  }

  private getKmsClient(): KMSClient {
    if (this.client) return this.client;

    this.client = new KMSClient({
      region: env.AWS_REGION!,
      ...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
        ? {
            credentials: {
              accessKeyId: env.AWS_ACCESS_KEY_ID,
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            },
          }
        : {}), // falls back to IAM role / instance profile / env vars from AWS SDK chain
    });
    return this.client;
  }
}

export const awsKmsService = new AwsKmsService();
