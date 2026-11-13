(() => {
  const coat = {
    '#': '#543b36', O: '#b96e40', o: '#df9857', g: '#f5be7a',
    w: '#fff0d5', c: '#e3cdaa', p: '#e89b8a', r: '#83334c', s: '#b44e66',
    d: '#5f4944', b: '#8b6151', h: '#b48366', t: '#d5a77a', k: '#322e31',
  };

  // A black-tipped nose and swinging ear give the dog a different profile from the tabby.
  const catHead = [
    ' #      #', ' #g#   #g#', ' #gp###pg#', '#gggoooggg#', '#ogggogggg#',
    '#gwwggwwgg#', '#gwkwwkwgg#', '#gwwwwwwggp', ' #gwcpwww#', '  #ggwww#', '   #####',
  ];
  const dogHead = [
    '   ######', '  #bttggg#', ' #bbhttggg#', '#dbbhtwkwt#',
    '#dbbhtwwwwwk', '#dbhtcwwwww#', ' #dhctcwww#', '  #d#wwww#', '     ####',
  ];
  const catBody = [
    '  ########', ' #googoogor#', '#ggoogooggrs#', '#oggggggggsr#',
    '#oggggccwwr#', '#Oogggcwww#', ' #Oogcccw#', '  #######',
  ];
  const dogBody = [
    '   #######', '  #wwwhhhw#', ' #wwwhbbhww#', '#wwcwhbbwwww#',
    '#wccwwwwwwww#', '#wcwwwwwccw#', ' #cccccccc#', '  ########',
  ];
  const catTails = [
    [' #', '#g#', '#o#', '#g#', ' #o#', ' #g#', '  #go#', '   ###'],
    ['  ##', ' #og#', ' #g#', ' #o#', ' #g#', '  #o#', '  #go#', '   ###'],
    ['   ##', '  #og#', '  #g#', '  #o#', ' #g#', '  #o#', '  #go#', '   ###'],
  ];
  const dogTails = [
    ['#', '#w#', ' #t#', '  #hh#', '   ###'],
    [' ##', ' #w#', '  #t#', '  #hh#', '   ###'],
    ['  #', ' #w#', ' #t#', '  #hh#', '   ###'],
  ];
  const leg = ['###', '#c#', '#w#', '##w#'];
  const farLeg = ['##', '#b#', ' ##'];
  function stamp(ctx, rows, x, y) {
    rows.forEach((row, dy) => {
      for (let dx = 0; dx < row.length; dx++) {
        if (row[dx] !== ' ') {
          ctx.fillStyle = coat[row[dx]];
          ctx.fillRect(x + dx, y + dy, 1, 1);
        }
      }
    });
  }

  function drawAnimal(ctx, x, y, options, dog) {
    const { facing = 1, pose = 'idle', frame = 0 } = options || {};
    const f = Math.floor(Math.abs(frame)) % 4;
    const moving = pose === 'walk' || pose === 'run' || pose === 'play';
    const sniff = pose === 'sniff';
    const playful = pose === 'play';
    const step = moving ? [0, 1, 0, -1][f] : 0;
    const lift = playful ? [0, -1, -2, -1][f] : 0;
    const bob = moving && (f === 1 || f === 3) ? -1 : 0;
    const swish = [0, 1, 2, 1][f];

    ctx.save();
    ctx.translate(Math.round(x), Math.round(y) + lift);
    ctx.scale(facing < 0 ? -1 : 1, 1);
    stamp(ctx, dog ? dogTails[swish] : catTails[swish], -11, (dog ? -12 : -15) + bob);
    stamp(ctx, farLeg, -4 + step, -3);
    stamp(ctx, farLeg, 4 - step, -3);
    stamp(ctx, leg, -6 - step, -4);
    stamp(ctx, leg, 2 + step, -4 + (playful && f === 2 ? -1 : 0));
    stamp(ctx, dog ? dogBody : catBody, -7, -10 + bob);
    // Dogs dip their muzzle to the grass; the cat hunkers down to pounce.
    const headY = (dog ? -16 : -19) + bob + (sniff ? 3 + (f % 2) : 0) + (playful && f === 0 ? 1 : 0);
    stamp(ctx, dog ? dogHead : catHead, dog ? 0 : 1, headY);
    if (!dog) {
      stamp(ctx, ['rrrss#', ' #r#', ' #s#'], 2, headY + 10);
      if (pose === 'idle' && f === 3) {
        ctx.fillStyle = coat.w;
        ctx.fillRect(4, headY + 6, 1, 1);
        ctx.fillRect(7, headY + 6, 1, 1);
      }
    } else if (pose === 'play' && f === 2) {
      ctx.fillStyle = coat.p;
      ctx.fillRect(9, headY + 6, 1, 2);
    }
    ctx.restore();
  }

  const day = { meadow:'#9aa882', grass:'#759466', tip:'#c2c8a0', soil:'#ac886a',
    furrow:'#8c6c58', ridge:'#c9a889', stalk:'#72895f', gold:'#d9b55e', petal:'#e2aaa2' };
  const night = { meadow:'#78876d', grass:'#63805e', tip:'#a7b494', soil:'#8f7462',
    furrow:'#68554f', ridge:'#b3977d', stalk:'#91a385', gold:'#d0b366', petal:'#d19da3' };
  function drawBank(ctx, width, height, dark = false) {
    const p = dark ? night : day;
    const top = height - 13;
    const rect = (color,x,y,w,h) => { ctx.fillStyle=color; ctx.fillRect(x,y,w,h); };
    // The two ends of the verge taper into the surrounding transparent page.
    rect(p.meadow,5,top,width-12,1);
    rect(p.meadow,2,top+1,width-5,3);
    rect(p.grass,0,top+4,width-1,2);
    rect(p.soil,4,top+6,width-8,3);
    rect(p.soil,9,top+9,width-17,1);
    rect(p.soil,16,top+10,width-31,1);
    rect(p.furrow,22,top+11,width-46,1);
    for (let x=10; x<width-7; x+=13) {
      rect(p.tip,x,top+2,4,1);
      rect(p.grass,x+3,top,1,2);
      rect(p.ridge,x+1,top+6,4,1);
      rect(p.furrow,x-2,top+7,3,1);
      rect(p.furrow,x-4,top+8,2,1);
    }
    for (const [x,high,flower] of [[9,5,p.gold],[13,3,null],[width-18,6,p.petal],[width-13,4,p.gold]]) {
      rect(p.stalk,x,top-high,1,high+1);
      rect(p.grass,x-1,top-2,1,2);
      rect(p.tip,x+1,top-3,1,1);
      if (flower) {
        rect(flower,x-1,top-high,3,1);
        rect(flower,x,top-high-1,1,3);
        rect(p.ridge,x,top-high,1,1);
      }
    }
  }

  window.FieldArt = {
    drawBank,
    drawCat: (ctx,x,y,options) => drawAnimal(ctx,x,y,options,false),
    drawDog: (ctx,x,y,options) => drawAnimal(ctx,x,y,options,true),
  };
})();
