const fs = require('fs');
const { Octokit } = require("@octokit/rest");
const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

(async () => {
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;
  const bucketName = process.env.BUCKET_NAME;

  const { data: publicKey } = await octokit.rest.actions.getRepoPublicKey({
    owner,
    repo,
  });

  const messageBytes = naclUtil.decodeUTF8(bucketName);
  const keyBytes = naclUtil.decodeBase64(publicKey.key);
  const encryptedBytes = nacl.box.keyPair.fromSecretKey(keyBytes).publicKey;
  const encryptedValue = naclUtil.encodeBase64(encryptedBytes);

  await octokit.rest.actions.createOrUpdateRepoSecret({
    owner,
    repo,
    secret_name: 'BUCKET_NAME',
    encrypted_value: encryptedValue,
    key_id: publicKey.key_id,
  });
})();
