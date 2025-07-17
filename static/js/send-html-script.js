window.addEventListener('message', (event) => {
  if (event.data?.source?.includes('react-devtools')) return;

  console.log('Received message from parent:', event.data);
  if (event.data.type === 'get-body-ref') {
    event.source.postMessage(
      { type: 'body-ref-response', bodyHTML: document.body.innerHTML },
      "http://localhost:3001"
    );
  } else if (event.data.type === 'set-body-ref') {
    document.body.innerHTML = event.data.bodyHTML;
  }
});