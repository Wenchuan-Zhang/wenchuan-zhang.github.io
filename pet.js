(() => {
  // Each character is a pixel. The scarf stays on the body as the cat looks up.
  const colors = {
    '#': '#493534', o: '#cf8656', g: '#edbc86', c: '#fae3bb',
    w: '#fff2d6', p: '#dd9c91', r: '#8d3c53', s: '#b95665',
  };
  const head = [
    '      ##         ##', '      #g#       #g#', '      #gp#######pg#',
    '      #pgggooogggp#', '     #ggggoogoogggg#', '    #ggggggogogggggg#',
    '    #ggccccgggccccgg#', '    #gcc##ccccc##ccg#', '    #gcc##ccccc##ccg#',
    '   ##gppccccpccccppg##', '    #gcccccc#ccccccg#', '     #ggccw#w#wccgg#',
    '      ##ggccccggg##',
  ];
  const body = [
    '       #rsssssssrr#', '       #rrr#rrrrr#o#', '      #ggrss#ccgggoo#',
    '      #gg#rr#ccgggoo#', '      #ggc##cccggggo#', '      #gccwccccg#ggg#',
    '      #gccwccwcg#ggg#', '      #ggcwccwcg#ggg#', '      #g#cwc#wcg#ggg#',
    '     #wc#wwc#wwc#ccoo#', '     #################',
  ];
  // Three overlapping silhouettes let the tail uncurl and sweep back.
  const tails = [
    ['      ##', '     #go#', '     #go#', '    #go#', '   #go#', ' ##go#', '#goo#', ' ###'],
    ['        ##', '       #go#', '       #go#', '       #go#', '     ##go#', '   ##goo#', '#ggooo##', ' #####'],
    ['          ', '          ', '          ', '          ##', '         #go#', '     ####go#', '#gggooooo##', ' ########'],
  ];
  const paw = [' ##', '#ww#', '#cc#', ' #cg#', '  #go#', '   ##'];
  const cat = document.createElement('button');
  cat.type = 'button';
  cat.className = 'site-pet';
  cat.title = 'Pet the cat';
  cat.setAttribute('aria-label', 'Pet the cat');
  const canvas = document.createElement('canvas');
  canvas.width = 35;
  canvas.height = 32;
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  cat.append(canvas);
  (document.querySelector('footer') || document.body).append(cat);

  function drawPixels(rows, x, y) {
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        if (row[i] === ' ') continue;
        ctx.fillStyle = colors[row[i]];
        ctx.fillRect(x + i, y + j, 1, 1);
      }
    });
  }

  function draw(tail = 0, gesture = '', gaze = false) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPixels(tails[tail], 18, 21);
    drawPixels(body, 1, 18);
    const x = gaze ? 2 : 1;
    const y = gaze ? 4 : 5;
    const face = head.slice();
    if (gesture === 'twitch') {
      face[0] = '                 ##';
      face[1] = '    ###         #g#';
      face[2] = '     #gp########pg#';
    }
    if (gesture === 'blink') face[7] = '    #gcccccccccccccg#';
    drawPixels(face, x, y);
    if (gesture === 'wave') drawPixels(paw, 3, 17);
  }

  // Most time is spent sitting still, with brief bursts of movement.
  const idle = [
    {ms: 1400}, {tail: 1, ms: 240}, {tail: 2, ms: 390}, {tail: 1, ms: 260},
    {ms: 1100}, {gesture: 'blink', ms: 110}, {ms: 750},
    {gesture: 'twitch', ms: 170}, {ms: 2100},
    {tail: 1, gaze: true, ms: 680}, {tail: 2, gaze: true, ms: 210}, {tail: 1, ms: 180},
  ];
  const reactions = {
    hop: [{tail: 1, gesture: 'blink', ms: 90}, {tail: 2, gaze: true, ms: 240},
          {tail: 1, ms: 130}, {gesture: 'blink', ms: 300}],
    wave: [{gaze: true, ms: 130}, {gesture: 'wave', tail: 1, ms: 200},
           {gaze: true, tail: 2, ms: 130}, {gesture: 'wave', tail: 1, ms: 320}],
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer;
  let idleIndex = 0;
  let looking = false;
  let nextReaction = 'hop';
  function stepIdle() {
    clearTimeout(timer);
    delete cat.dataset.action;
    cat.classList.remove('site-pet-happy');
    if (document.hidden || reduced.matches) { draw(); return; }
    const pose = idle[idleIndex];
    draw(pose.tail, pose.gesture, pose.gaze || looking);
    idleIndex = (idleIndex + 1) % idle.length;
    timer = setTimeout(stepIdle, pose.ms);
  }
  function play(frames, index = 0) {
    if (index === frames.length) { stepIdle(); return; }
    const pose = frames[index];
    draw(pose.tail, pose.gesture, pose.gaze);
    timer = setTimeout(() => play(frames, index + 1), pose.ms);
  }

  cat.addEventListener('click', () => {
    clearTimeout(timer);
    cat.classList.add('site-pet-happy');
    if (reduced.matches) {
      cat.dataset.action = 'heart';
      timer = setTimeout(stepIdle, 800);
      return;
    }
    cat.dataset.action = nextReaction;
    play(reactions[nextReaction]);
    nextReaction = nextReaction === 'hop' ? 'wave' : 'hop';
  });
  function look(up) {
    looking = up;
    if (!reduced.matches && !cat.dataset.action) draw(1, '', up);
  }
  cat.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') look(true); });
  cat.addEventListener('pointerleave', () => look(false));
  reduced.addEventListener('change', stepIdle);
  document.addEventListener('visibilitychange', stepIdle);
  stepIdle();
})();
