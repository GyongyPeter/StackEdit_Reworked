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
  md.core.ruler.after('block', 'yt-embed', ({ tokens, Token }) => {
    for (let i = 2; i < tokens.length; i += 1) {
      const token = tokens[i];

      const match = token.content.match(`^(.*){(YT|yt)}:[ \t]\\((.*)(youtube.com)(.+)\\)(.*)$`);

      if (token.content && match) {
        // token.content = "";
        // for (let j = 0; j < match.length; j++) {
        //     token.content += match[j];
        // }

        attrSet(tokens[i - 1], 'class', 'yt-embed');
      }
    }
  });
};