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
    md.core.ruler.after('block', 'drag-drop', ({ tokens, Token }) => {
      for (let i = 2; i < tokens.length; i += 1) {
        const token = tokens[i];

        if (token.content &&
          token.content.match(`^(.?[ \t]|.+[ \t]|)(\\$dd)(([ \t])(.+)|[ \t]|)$`)) {
            token.content = token.content.replace("$dd", "");
  
          attrSet(tokens[i - 1], 'class', 'drag-drop');
        }
      }
    });
  };