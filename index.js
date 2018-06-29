const commandLineArgs = require('command-line-args');
const PO = require('pofile');
const translate = require('google-translate-api');


const optionDefinitions = [
  { name: 'input',  defaultOption: true },
  { name: 'from' },
  { name: 'to' },
  { name: 'output' }
];

const options = commandLineArgs(optionDefinitions);


PO.load(options.input, (err, po) => {
  if(err || po.items.length === 0){
    throw new Error('Invalid file or empty items');
  }
  let timeout = 0;
  const promises = po.items.map((item) => {
    return new Promise(resolve => {
      timeout += 200;

      setTimeout(() => {
        console.log(`Translating: ${item.msgstr[0]}`);
        return translate(item.msgstr[0], {to: options.to, from: options.from}).then(res => {
          item.msgstr[0] =  res.text;
          return resolve(item);
        }).catch(err => {
          console.error(err);
        });
      }, timeout)
    });
  });

  Promise.all(promises).then((_values) => {
    po.save(options.output, (err) => {
      console.log(err);
    });
  });
});
