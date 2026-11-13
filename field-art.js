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

  const day = {
    distant: '#dae1c8', hillside: '#c6d2ac', meadow: '#a7bc8d', shade: '#87a576',
    grass: '#75936a', tip: '#d3d9aa', stem: '#849665', fence: '#b9aa8c',
    gold: '#e1ba69', petal: '#daa5a6', ivory: '#f4e8c6', soil: '#ab8d70', ridge: '#c5aa87',
  };
  const night = {
    distant: '#344544', hillside: '#435750', meadow: '#566f60', shade: '#496357',
    grass: '#6c8469', tip: '#9aa782', stem: '#84947a', fence: '#7c7868',
    gold: '#b29c64', petal: '#b48e96', ivory: '#c9c4a7', soil: '#665650', ridge: '#897462',
  };

  function drawBank(ctx, width, height, dark = false) {
    const p = dark ? night : day;
    const rect = (color, x, y, w, h) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    };
    // Landscape details stay planted in the same places after a resize or theme change.
    let seed = 981;
    function vary(min, max) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return min + Math.floor(seed / 4294967296 * (max - min + 1));
    }
    const top = height - 9;
    const rise = x => Math.round(1.4 * Math.sin(x / 37) + .8 * Math.sin(x / 13));
    for (let x = 0; x < width; x += 4) {
      const distantY = top - 6 + Math.round(2.4 * Math.sin(x / 75 + .1) + 1.6 * Math.sin(x / 34));
      const hillsideY = top - 3 + Math.round(1.5 * Math.sin(x / 57 + 1.7));
      rect(p.distant, x, distantY, 4, height - distantY);
      rect(p.hillside, x, hillsideY, 4, height - hillsideY);
      const edge = top + rise(x);
      rect(p.meadow, x, edge, 4, height - edge);
    }

    // Low wooden field gates alternate with open stretches of pasture.
    for (let x = 39; x < width; x += vary(124, 208)) {
      const y = top - 3 + rise(x);
      const posts = vary(3, 5);
      rect(p.fence, x, y - 3, (posts - 1) * 6, 1);
      rect(p.fence, x, y - 1, (posts - 1) * 6, 1);
      for (let i = 0; i < posts; i++) rect(p.fence, x + 6 * i, y - 4, 1, 6);
    }

    // Small clumps of field flowers and seed heads leave gaps for the animals.
    for (let x = 6; x < width; x += vary(18, 43)) {
      const blooms = vary(1, 3);
      const flower = [p.ivory, p.gold, p.petal][vary(0, 2)];
      for (let n = 0; n < blooms; n++) {
        const stemX = x + n * 3 + vary(0, 2);
        const y = top + rise(stemX) + 2;
        const stem = vary(3, 6);
        rect(p.stem, stemX, y - stem, 1, stem);
        rect(p.grass, stemX - 1, y - 2, 1, 2);
        if (stem >= 4) {
          rect(flower, stemX - 1, y - stem, 3, 1);
          rect(flower, stemX, y - stem - 1, 1, 2);
        }
      }
    }

    rect(p.shade, 0, height - 4, width, 2);
    rect(p.soil, 0, height - 2, width, 2);
    for (let x = 0; x < width; x += vary(8, 19)) {
      const y = top + vary(2, 4);
      rect(p.grass, x, y, 2, 1);
      rect(p.tip, x + 2, y - 1, vary(1, 3), 1);
      rect(p.ridge, x + 3, height - 2, vary(2, 5), 1);
    }
  }

  window.FieldArt = {
    drawBank,
    drawCat: (ctx,x,y,options) => drawAnimal(ctx,x,y,options,false),
    drawDog: (ctx,x,y,options) => drawAnimal(ctx,x,y,options,true),
  };
})();
