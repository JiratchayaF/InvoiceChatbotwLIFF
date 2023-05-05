// window.onload = function() {
//     if ("<%= message %>") {
//       alert('<%= message %>');
//     }
//   };

const urlParams = new URLSearchParams(window.location.search);
const alertType = urlParams.get('alert');
  
  if (alertType === 'success') {
    alert('Request submitted successfully!');
  }