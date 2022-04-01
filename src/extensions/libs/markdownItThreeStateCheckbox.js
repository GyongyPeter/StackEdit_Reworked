function attrSet(token, name, value) {
    const index = token.attrIndex(name);
    const attr = [name, value];
  
    if (index < 0) {
      token.attrPush(attr);
    } else {
      token.attrs[index] = attr;
    }
  }
  
module.exports = (md) => {
    md.core.ruler.after('block', 'threeStateCheckbox', ({ tokens, Token }) => {
      for (let i = 2; i < tokens.length; i += 1) {
        const token = tokens[i];

        if (token.content &&
          token.content.match(/€€€[123]/gm)) {

          if(token.content.match(/^(.?[ \t]|.+[ \t]|)[€]+1[\s\S]*$/gm)) {
            token.content = token.content.replace("€€€1", '\u2753');
          } else
          if(token.content.match(/^(.?[ \t]|.+[ \t]|)[€]+2[\s\S]*$/gm)) {
            token.content = token.content.replace("€€€2", '\u2705');
          } else
          if(token.content.match(/^(.?[ \t]|.+[ \t]|)[€]+3[\s\S]*$/gm)) {
            token.content = token.content.replace("€€€3", '\u274C');
          }
  
          attrSet(tokens[i - 1], 'class', 'threeStateCheckbox');
        }
      }
    });
  };