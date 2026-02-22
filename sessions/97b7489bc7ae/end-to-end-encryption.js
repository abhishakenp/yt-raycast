<CryptoService> {
    if (!CryptoService.instance) {
      await sodium.ready;
      CryptoService.instance = new CryptoService();
    }
    return CryptoService.instance;
  }

  // Generate a new X25519 key pair for a user
  generateKeyPair(): { publicKey: Uint8Array; privateKey: Uint8Array } {
    return sodium.crypto_box_keypair();
  }

  // Encrypt a symmetric key (Uint8Array) with the user's public key
  encryptSymmetricKey(
    symmetricKey: Uint8Array,
    userPublicKey: Uint8Array,
    serverPrivateKey: Uint8Array
  ): Uint8Array {
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const ciphertext = sodium.crypto_box_easy(
      symmetricKey,
      nonce,
      userPublicKey,
      serverPrivateKey
    );
    // prepend nonce for later decryption
    return sodium.concat(nonce, ciphertext);
  }

  // Decrypt a symmetric key encrypted with the server's public key
  decryptSymmetricKey(
    encrypted: Uint8Array,
    userPrivateKey: Uint8Array,
    serverPublicKey: Uint8Array
  ): Uint8Array {
    const nonce = encrypted.subarray(0, sodium.crypto_box_NONCEBYTES);
    const ciphertext = encrypted.subarray(sodium.crypto_box_NONCEBYTES);
    return sodium.crypto_box_open_easy(
      ciphertext,
      nonce,
      serverPublicKey,
      userPrivateKey
    );
  }

  // Encrypt arbitrary data with a symmetric key (AES-GCM via libsodium secretbox)
  encryptData(
    plaintext: Uint8Array,
    symmetricKey: Uint8Array
  ): Uint8Array {
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = sodium.crypto_secretbox_easy(plaintext, nonce, symmetricKey);
    return sodium.concat(nonce, ciphertext);
  }

  // Decrypt data encrypted with encryptData
  decryptData(
    encrypted: Uint8Array,
    symmetricKey: Uint8Array
  ): Uint8Array {
    const nonce = encrypted.subarray(0, sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = encrypted.subarray(sodium.crypto_secretbox_NONCEBYTES);
    return sodium.crypto_secretbox_open_easy(ciphertext, nonce, symmetricKey);
  }

  // Helper to convert Uint8Array <-> base64 string for transport/storage
  toBase64(buf: Uint8Array): string {
    return Buffer.from(buf).toString('base64');
  }

  fromBase64(b64: string): Uint8Array {
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }
}

// src/controllers/messageController.ts
import { Request, Response } from 'express';
import { PrismaClient, Message } from '@prisma/client';
import { CryptoService } from '../services/cryptoService';

const prisma = new PrismaClient();

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { encryptedContent, iv, tag } = req.body; // client already encrypted payload (base64)

    // Store ciphertext as-is; server never sees plaintext
    const message = await prisma.message.create({
      data: {
        chatId: Number(chatId),
        encryptedContent,
        iv,
        tag,
        createdAt: new Date(),
      },
    });

    res.status(201).json({ id: message.id });
  } catch (err) {
    console.error('createMessage error:', err);
    res.status(500).json({ error: 'Failed to store message' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const messages = await prisma.message.findMany({
      where: { chatId: Number(chatId) },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        encryptedContent: true,
        iv: true,
        tag: true,
        createdAt: true,
      },
    });

    // Return ciphertext blobs; client will decrypt using its symmetric key
    res.json(messages);
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

export const storeUserPublicKey = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { publicKey } = req.body; // base64 string

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { publicKey },
    });

    res.status(200).json({ message: 'Public key stored' });
  } catch (err) {
    console.error('storeUserPublicKey error:', err);
    res.status(500).json({ error: 'Failed to store public key' });
  }
};

export const storeEncryptedSymmetricKey = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { encryptedSymmetricKey } = req.body; // base64 string

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { encryptedSymmetricKey },
    });

    res.status(200).json({ message: 'Encrypted symmetric key stored' });
  } catch (err) {
    console.error('storeEncryptedSymmetricKey error:', err);
    res.status(500).json({ error: 'Failed to store encrypted symmetric key' });
  }
};

export const getEncryptedSymmetricKey = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { encryptedSymmetricKey: true },
    });

    if (!user?.encryptedSymmetricKey) {
      return res.status(404).json({ error: 'No encrypted key found' });
    }

    res.json({ encryptedSymmetricKey: user.encryptedSymmetricKey });
  } catch (err) {
    console.error('getEncryptedSymmetricKey error:', err);
    res.status(500).json({ error: 'Failed to retrieve encrypted symmetric key' });
  }
};

// src/routes/messageRoutes.ts
import { Router } from 'express';
import {
  createMessage,
  getMessages,
  storeUserPublicKey,
  storeEncryptedSymmetricKey,
  getEncryptedSymmetricKey,
} from '../controllers/messageController';

const router = Router();

// Message endpoints (encrypted payloads)
router.post('/chats/:chatId/messages', createMessage);
router.get('/chats/:chatId/messages', getMessages);

// User key management
router.post('/users/:userId/public-key', storeUserPublicKey);
router.post('/users/:userId/encrypted-symmetric-key', storeEncryptedSymmetricKey);
router.get('/users/:userId/encrypted-symmetric-key', getEncryptedSymmetricKey);

export default router;

// prisma/schema.prisma (relevant parts)
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                     Int      @id @default(autoincrement())
  email                  String   @unique
  passwordHash           String
  publicKey              String?  // base64 encoded X25519 public key
  encryptedSymmetricKey  String?  // base64 encrypted symmetric key (encrypted with server's private key)
  chats                  Chat[]
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}

model Chat {
  id        Int       @id @default(autoincrement())
  title     String?
  userId    Int
  user      User      @relation(fields: [userId], references: [id])
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id               Int      @id @default(autoincrement())
  chatId           Int
  chat             Chat     @relation(fields: [chatId], references: [id])
  encryptedContent String   // base64 ciphertext (secretbox)
  iv               String?  // optional if using AES-GCM; kept for compatibility
  tag              String?  // optional authentication tag
  createdAt        DateTime @default(now())
}

// src/app.ts (entry point snippet)
import express from 'express';
import cors from 'cors';
import messageRoutes from './routes/messageRoutes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' })); // encrypted payloads can be sizable
app.use('/api', messageRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});