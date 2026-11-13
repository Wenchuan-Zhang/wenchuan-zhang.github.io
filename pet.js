(() => {
  const art = window.FieldArt;
  const canvas = document.createElement('canvas');
  const landscape = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const terrain = landscape.getContext('2d');
  if (!art || !ctx || !terrain) return;

  const meadow = document.createElement('button');
  meadow.type = 'button';
  meadow.className = 'site-pet';
  meadow.setAttribute('aria-label', 'Play with the cat and dog');
  canvas.setAttribute('aria-hidden', 'true');
  meadow.append(canvas);
  document.querySelector('footer').append(meadow);

  const height = 42;
  const margin = 13;
  const cat = { draw: art.drawCat, feet: 34, facing: 1, offset: 0, rest: .3 };
  const dog = { draw: art.drawDog, feet: 37, facing: -1, offset: 2, rest: .8 };
  const animals = [cat, dog];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const random = (min, max) => min + Math.random() * (max - min);
  let width = 0;
  let elapsed = 0;
  let timer, heartTimer, lastTick;
  let nextTag = 7;
  let ball = null;

  function inBounds(x) {
    return Math.max(margin, Math.min(width - margin, x));
  }

  function choosePath(animal) {
    // Mix short visits to nearby flowers with walks into a different part of the field.
    const step = random(.1, .38) * width;
    const direction = animal.x < width * .2 ? 1 : animal.x > width * .8 ? -1 : Math.random() < .5 ? -1 : 1;
    animal.target = inBounds(animal.x + direction * step);
    animal.speed = Math.max(12, width / 18) * random(.75, 1.2);
    animal.rest = random(.6, 2.3);
    animal.pausePose = Math.random() < .65 ? 'sniff' : 'idle';
    animal.gait = 'walk';
  }

  function startTag() {
    const lead = Math.random() < .5 ? cat : dog;
    const follower = lead === cat ? dog : cat;
    const direction = lead.x < width / 2 ? 1 : -1;
    lead.target = direction > 0 ? width - margin : margin;
    follower.target = inBounds(lead.target - direction * 21);
    lead.speed = Math.max(30, width / 7);
    const duration = Math.abs(lead.target - lead.x) / lead.speed;
    follower.speed = Math.max(26, Math.abs(follower.target - follower.x) / Math.max(1, duration));
    lead.gait = follower.gait = 'run';
    lead.rest = 0;
    follower.rest = .45;
    nextTag = elapsed + duration + random(5, 10);
  }

  function advance(animal, dt) {
    if (animal.rest > 0) {
      animal.rest -= dt;
      animal.pose = animal.pausePose || 'idle';
      return;
    }
    const distance = animal.target - animal.x;
    if (Math.abs(distance) < .5) {
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
    animal.pose = animal.gait;
  }

  function tossBall(position) {
    if (motion.matches) {
      meadow.dataset.playing = 'heart';
      clearTimeout(heartTimer);
      paint();
      heartTimer = window.setTimeout(() => {
        delete meadow.dataset.playing;
        paint();
      }, 1100);
      return;
    }

    const center = (cat.x + dog.x) / 2;
    const end = inBounds(position ?? (center < width / 2 ? width * .76 : width * .24));
    const direction = end >= center ? 1 : -1;
    ball = { start: inBounds(end - direction * 44), end, age: 0 };
    meadow.dataset.playing = 'fetch';
    cat.target = inBounds(end - direction * 13);
    dog.target = inBounds(end + direction * 9);
    cat.rest = .24;
    dog.rest = .08;
    cat.speed = Math.max(30, Math.abs(cat.target - cat.x) / 2.9);
    dog.speed = Math.max(34, Math.abs(dog.target - dog.x) / 2.65);
    cat.gait = dog.gait = 'run';
    nextTag = elapsed + 11;
    paint();
  }

  function drawBall() {
    const t = Math.min(ball.age, 1);
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
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(landscape, 0, 0);
    for (const animal of animals) {
      const pose = motion.matches ? 'idle' : animal.pose || 'idle';
      const rate = pose === 'run' ? 8 : pose === 'walk' ? 5 : 1.8;
      const frame = motion.matches ? 0 : Math.floor(elapsed * rate + animal.offset) % 4;
      animal.draw(ctx, Math.round(animal.x), animal.feet, { facing: animal.facing, pose, frame });
    }
    if (ball) drawBall();
    if (meadow.dataset.playing === 'heart') {
      const x = Math.round((cat.x + dog.x) / 2);
      ctx.fillStyle = '#ce7586';
      ctx.fillRect(x - 2, 9, 2, 1);
      ctx.fillRect(x + 1, 9, 2, 1);
      ctx.fillRect(x - 2, 10, 5, 2);
      ctx.fillRect(x - 1, 12, 3, 1);
      ctx.fillRect(x, 13, 1, 1);
    }
  }

  function rebuildTerrain() {
    terrain.clearRect(0, 0, width, height);
    art.drawBank(terrain, width, height, document.documentElement.dataset.theme === 'dark');
    paint();
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.height || !bounds.width) return;
    // CSS scales the whole pixel grid uniformly, including on high-DPI screens.
    const newWidth = Math.max(2 * margin + 1, Math.round(bounds.width * height / bounds.height));
    if (width === newWidth) return;
    const previous = width;
    width = newWidth;
    canvas.width = landscape.width = width;
    canvas.height = landscape.height = height;
    if (previous) {
      const scale = width / previous;
      for (const animal of animals) {
        animal.x = inBounds(animal.x * scale);
        animal.target = inBounds(animal.target * scale);
        animal.speed *= scale;
      }
      if (ball) {
        ball.start = inBounds(ball.start * scale);
        ball.end = inBounds(ball.end * scale);
      }
    } else {
      cat.x = inBounds(width * .73);
      dog.x = inBounds(width * .86);
      cat.target = inBounds(width * .84);
      dog.target = inBounds(width * .61);
      for (const animal of animals) {
        animal.speed = Math.max(12, width / 20);
        animal.gait = 'walk';
      }
    }
    rebuildTerrain();
  }

  function tick() {
    const now = performance.now();
    const dt = Math.min((now - lastTick) / 1000, .25);
    lastTick = now;
    elapsed += dt;
    if (ball) {
      ball.age += dt;
      if (ball.age >= 4.1) {
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
    clearTimeout(heartTimer);
    ball = null;
    delete meadow.dataset.playing;
    if (document.hidden) return;
    paint();
    if (!motion.matches) {
      lastTick = performance.now();
      timer = window.setTimeout(tick, 90);
    }
  }

  // The artwork is click-through. A click on grass or either pet can play fetch
  // without taking clicks or touches away from links and controls behind it.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || !event.detail ||
        event.target.closest('a, button, input, select, textarea, label, [role="button"], [contenteditable="true"]')) return;
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * width / bounds.width;
    const y = (event.clientY - bounds.top) * height / bounds.height;
    const onPet = animals.some(animal => Math.abs(animal.x - x) < 13 && y >= animal.feet - 21 && y <= animal.feet);
    if (y <= height && (y >= height - 13 || onPet)) tossBall(x);
  });
  meadow.addEventListener('click', () => tossBall());
  motion.addEventListener('change', resume);
  document.addEventListener('visibilitychange', resume);
  new MutationObserver(rebuildTerrain).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  new ResizeObserver(resize).observe(canvas);
  resize();
  resume();
})();
