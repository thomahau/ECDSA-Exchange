import './index.scss';

const server = 'http://localhost:3042';

document.getElementById('exchange-address').addEventListener('input', ({ target: { value } }) => {
  if (value === '') {
    document.getElementById('balance').innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`)
    .then(response => {
      return response.json();
    })
    .then(({ balance }) => {
      document.getElementById('balance').innerHTML = balance;
    });
});

document.getElementById('transfer-amount').addEventListener('click', async () => {
  const sender = document.getElementById('exchange-address').value;
  const amount = document.getElementById('send-amount').value;
  const recipient = document.getElementById('recipient').value;
  const privateKey = document.getElementById('private-key').value;

  const body = JSON.stringify({
    sender,
    amount,
    recipient,
    privateKey,
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' } })
    .then(response => {
      return response.json();
    })
    .then(data => {
      if (data.balance) {
        document.getElementById('balance').innerHTML = data.balance;
      } else {
        document.getElementById('error').innerHTML = data.error;
      }
    });
});
