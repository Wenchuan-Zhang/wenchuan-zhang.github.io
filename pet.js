(() => {
  const art = window.FieldArt;
  const canvas = document.createElement('canvas');
  canvas.width = 108;
  canvas.height = 46;
  const ctx = canvas.getContext('2d');
  if (!ctx || !art) return;
  canvas.setAttribute('aria-hidden', 'true');

  const meadow = document.createElement('button');
  meadow.type = 'button';
  meadow.className = 'site-pet';
  meadow.title = 'Play with the cat and dog';
  meadow.setAttribute('aria-label', meadow.title);
  meadow.append(canvas);
  document.querySelector('footer').append(meadow);

  const random = (min, max) => min + Math.random() * (max - min);
  const cat = { draw: art.drawCat, x: 29, feet: 36, target: 59, facing: 1, speed: 8, rest: 0, offset: 0 };
  const dog = { draw: art.drawDog, x: 78, feet: 39, target: 65, facing: -1, speed: 11, rest: 0.9, offset: 2 };
  const animals = [cat, dog];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed = 0;
  let timer, lastTick;
  let ball = null;
  let nextTag = 10;

  function choosePath(animal) {
    // Pick a grazing spot far enough away for a short, visible walk.
    const nearEnd = random(14, Math.max(14, animal.x - 19));
    const farEnd = random(Math.min(94, animal.x + 19), 94);
    animal.target = animal.x < 33 || (animal.x < 75 && Math.random() < .5) ? farEnd : nearEnd;
    animal.speed = animal === cat ? random(6, 11) : random(8, 14);
    animal.rest = random(.65, 2.6);
    animal.pausePose = Math.random() < .6 ? 'sniff' : 'idle';
  }

  function advance(animal, dt) {
    if (animal.rest > 0) {
      animal.rest -= dt;
      animal.pose = animal.pausePose || 'idle';
      return;
    }
    const distance = animal.target - animal.x;
    if (Math.abs(distance) < 0.6) {
      if (ball) {
        animal.facing = ball.end > animal.x ? 1 : -1;
        animal.pose = animal === dog ? 'sniff' : 'play';
      } else {
        choosePath(animal);
      }
      return;
    }
    animal.facing = Math.sign(distance);
    animal.x += animal.facing * Math.min(Math.abs(distance), animal.speed * dt);
    animal.pose = animal.speed >= 20 ? 'run' : 'walk';
  }

  function startTag() {
    // Sometimes one dashes ahead while the other follows on the near path.
    const lead = Math.random() < .5 ? cat : dog;
    const follower = lead === cat ? dog : cat;
    lead.target = lead.x < 54 ? 92 : 16;
    follower.target = lead.target + (lead.target > 54 ? -21 : 21);
    lead.speed = 23;
    follower.speed = 21;
    lead.rest = 0;
    follower.rest = .4;
    nextTag = elapsed + random(12, 20);
  }

  function tossBall() {
    if (motion.matches) {
      meadow.dataset.playing = 'heart';
      clearTimeout(timer);
      paint();
      timer = window.setTimeout(() => {
        delete meadow.dataset.playing;
        paint();
      }, 1100);
      return;
    }
    const end = (cat.x + dog.x) / 2 < 54 ? 80 : 28;
    const sign = end > 54 ? 1 : -1;
    ball = { start: end - sign * 44, end, age: 0 };
    meadow.dataset.playing = 'fetch';
    cat.target = end - sign * 13;
    dog.target = end + sign * 9;
    cat.rest = .28;
    dog.rest = .12;
    cat.speed = 25;
    dog.speed = 31;
    nextTag = elapsed + 14;
    paint();
  }

  function drawBall() {
    const t = Math.min(ball.age / 1.0, 1);
    const x = Math.round(ball.start + (ball.end - ball.start) * t);
    const bounce = t < .67 ? 14 * Math.sin(Math.PI * t / .67) : 5 * Math.sin(Math.PI * (t - .67) / .33);
    const y = Math.round(36 - bounce);
    ctx.fillStyle = '#774334';
    ctx.fillRect(x - 1, y - 3, 3, 4);
    ctx.fillRect(x - 2, y - 2, 5, 2);
    ctx.fillStyle = '#f8b66b';
    ctx.fillRect(x - 1, y - 2, 3, 2);
    ctx.fillStyle = '#fff0a2';
    ctx.fillRect(x - 1, y - 2, 1, 1);
  }

  function paint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    art.drawBank(ctx, canvas.width, canvas.height, document.documentElement.dataset.theme === 'dark');
    for (const animal of animals) {
      const pose = motion.matches ? 'idle' : animal.pose || 'idle';
      const rate = pose === 'run' ? 8 : pose === 'walk' ? 5 : 1.8;
      const frame = motion.matches ? 0 : Math.floor(elapsed * rate + animal.offset) % 4;
      animal.draw(ctx, Math.round(animal.x), animal.feet, { facing: animal.facing, pose, frame });
    }
    if (ball) drawBall();
  }

  function tick() {
    const now = performance.now();
    const dt = Math.min((now - lastTick) / 1000, .22);
    lastTick = now;
    elapsed += dt;
    if (ball) {
      ball.age += dt;
      if (ball.age >= 3.6) {
        ball = null;
        delete meadow.dataset.playing;
        animals.forEach(choosePath);
      }
    } else if (elapsed >= nextTag) {
      startTag();
    }
    for (const animal of animals) advance(animal, dt);
    paint();
    timer = window.setTimeout(tick, 90);
  }

  function resume() {
    clearTimeout(timer);
    ball = null;
    delete meadow.dataset.playing;
    if (document.hidden) return;
    paint();
    if (!motion.matches) {
      lastTick = performance.now();
      timer = window.setTimeout(tick, 90);
    }
  }

  meadow.addEventListener('click', tossBall);
  document.addEventListener('visibilitychange', resume);
  motion.addEventListener('change', resume);
  new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  resume();
})();
