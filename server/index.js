const { getPublicKey, sign, verify, utils } = require('ethereum-cryptography/secp256k1');
const express = require('express');
const app = express();
const cors = require('cors');

const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const keypairs = {};
const balances = {};

for (let i = 0; i < 3; i++) {
  const privateKeyArray = utils.randomPrivateKey();
  const publicKeyArray = getPublicKey(privateKeyArray);
  const address = '0x' + utils.bytesToHex(publicKeyArray).slice(-40);

  keypairs[address] = { publicKey: utils.bytesToHex(publicKeyArray), privateKey: utils.bytesToHex(privateKeyArray) };
  balances[address] = Math.floor(Math.random() * (100 - 1) + 1);
}

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', async (req, res) => {
  const { sender, recipient, amount, privateKey } = req.body;

  try {
    const messageHash = await utils.sha256(JSON.stringify({ sender, amount, recipient }));
    const signature = await sign(messageHash, privateKey);
    const isSigned = verify(signature, messageHash, keypairs[sender].publicKey);

    if (isSigned) {
      balances[sender] -= amount;
      balances[recipient] = (balances[recipient] || 0) + +amount;
      res.send({ balance: balances[sender] });
    } else {
      res.status(403).send({ error: 'Invalid private key' });
    }
  } catch (error) {
    res.status(403).send({ error: 'Invalid private key' });
  }
});

app.listen(port, () => {
  const addresses = Object.keys(balances);
  const addressBalances = Object.values(balances);

  console.log(`
  Available Accounts
  ==================
  (0) ${addresses[0]} (Balance: ${addressBalances[0]})
  (1) ${addresses[1]} (Balance: ${addressBalances[1]})
  (2) ${addresses[2]} (Balance: ${addressBalances[2]})

  Private Keys
  ==================
  (0) ${keypairs[addresses[0]].privateKey}
  (1) ${keypairs[addresses[1]].privateKey}
  (2) ${keypairs[addresses[2]].privateKey}
  `);

  console.log(`Listening on port ${port}!`);
});
