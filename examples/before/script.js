function go(page) {
  window.location.hash = page;
}

function save() {
  var amount = document.querySelector('input[type="number"]').value;
  if (!amount) {
    alert('Invalid input');
    return;
  }
  document.getElementById('modal').style.display = 'block';
  document.getElementById('modal').style.background = '#16a34a';
  document.getElementById('modal').innerText = '✅ Success!';
}
