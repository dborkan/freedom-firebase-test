setTimeout(function(port) {
  console.log('loading demo.json');
  freedom('demo.json').then(function(interface) {
    console.log('loaded demo.json');
    social = interface();
  });
}, 10);
