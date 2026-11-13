(() => {
  // One character is one pixel. Transparent space keeps the silhouette crisp at small sizes.
  const fur = {
    '#': '#493534', o: '#cf8656', g: '#edbc86', c: '#fae3bb',
    w: '#fff2d6', p: '#dd9c91', r: '#8d3c53', s: '#b95665',
  };
  const sprite = [
    '      ##         ##',
    '      #g#       #g#',
    '      #gp#######pg#',
    '      #pgggooogggp#',
    '     #ggggoogoogggg#',
    '    #ggggggogogggggg#',
    '    #ggccccgggccccgg#',
    '    #gcc##ccccc##ccg#',
    '    #gcc##ccccc##ccg#',
    '   ##gppccccpccccppg##',
    '    #gcccccc#ccccccg#',
    '     #ggccw#w#wccgg#',
    '      ##ggccccggg##',
    '       #rsssssssrr#',
    '       #rrr#rrrrr#o#',
    '      #ggrss#ccgggoo#',
    '      #gg#rr#ccgggoo#    ##',
    '      #ggc##cccggggo#   #go#',
    '      #gccwccccg#ggg#   #go#',
    '      #gccwccwcg#ggg#  #go#',
    '      #ggcwccwcg#ggg# #go#',
    '      #g#cwc#wcg#ggg##go#',
    '     #wc#wwc#wwc#ccoogoo#',
    '     ##################',
  ];

  function drawCat(blinking) {
    const canvas = document.createElement('canvas');
    canvas.width = 30;
    canvas.height = 26;
    canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d');
    sprite.forEach((row, y) => {
      Array.from(row).forEach((pixel, x) => {
        if (pixel === ' ') return;
        const eyelid = blinking && y === 7 && pixel === '#' && x > 6 && x < 18;
        ctx.fillStyle = eyelid ? fur.c : fur[pixel];
        ctx.fillRect(x, y + 1, 1, 1);
      });
    });
    return canvas;
  }

  const cat = document.createElement('button');
  cat.type = 'button';
  cat.className = 'site-pet';
  cat.setAttribute('aria-label', 'Pet the cat');
  cat.title = 'Pet the cat';
  const openEyes = drawCat(false);
  openEyes.className = 'site-pet-open';
  cat.append(drawCat(true), openEyes);

  let reset;
  cat.addEventListener('click', () => {
    cat.classList.add('site-pet-happy');
    window.clearTimeout(reset);
    reset = window.setTimeout(() => cat.classList.remove('site-pet-happy'), 900);
  });
  (document.querySelector('footer') || document.body).append(cat);
})();
