use std::cell::RefCell;

const PARTICLE_STRIDE: usize = 7;
const LEFT_RESET_CHANCE: f32 = 0.28;
const ROCKET_SPEED_SCALE: f32 = 0.66;
const ROCKET_HORIZONTAL_PUSH: f32 = 0.2;

#[derive(Clone, Copy)]
struct Particle {
    x: f32,
    y: f32,
    life: f32,
    speed: f32,
    size: f32,
    seed: f32,
    hue: f32,
    alpha: f32,
}

struct Simulation {
    width: f32,
    height: f32,
    tick: f32,
    rng_state: u32,
    particles: Vec<Particle>,
    output: Vec<f32>,
}

impl Simulation {
    const fn new() -> Self {
        Self {
            width: 1.0,
            height: 1.0,
            tick: 0.0,
            rng_state: 0x8d3f_2a19,
            particles: Vec::new(),
            output: Vec::new(),
        }
    }

    fn resize(&mut self, width: f32, height: f32) {
        self.width = width.max(1.0);
        self.height = height.max(1.0);
        let target = self.target_count();

        while self.particles.len() < target {
            let particle = self.create_particle(false);
            self.particles.push(particle);
        }
        self.particles.truncate(target);
        self.output.resize(target * PARTICLE_STRIDE, 0.0);
    }

    fn step(&mut self, delta_ms: f32) -> *const f32 {
        let _clamped_delta = delta_ms.clamp(1.0, 48.0);
        self.tick += 1.0;

        for index in 0..self.particles.len() {
            let mut particle = self.particles[index];
            let mut prev_x = particle.x;
            let mut prev_y = particle.y;
            let noise = smooth_noise(
                particle.x * 0.0036 + self.tick * 0.0007,
                particle.y * 0.0036 + particle.seed,
            );
            let drift = smooth_noise(particle.x * 0.0022, particle.y * 0.0022 + 50.0);
            let angle = noise * std::f32::consts::PI * 5.4 - std::f32::consts::PI * 0.22;
            let speed = particle.speed * (0.75 + drift * 1.45) * ROCKET_SPEED_SCALE;

            particle.x += angle.cos() * speed + ROCKET_HORIZONTAL_PUSH;
            particle.y += angle.sin() * speed * 0.82;
            particle.life -= 0.0011;

            if particle.life <= 0.0
                || particle.x < -40.0
                || particle.x > self.width + 40.0
                || particle.y < -40.0
                || particle.y > self.height + 40.0
            {
                let reset_left = self.next_unit() < LEFT_RESET_CHANCE;
                particle = self.create_particle(reset_left);
                prev_x = particle.x;
                prev_y = particle.y;
            }

            self.particles[index] = particle;
            let pulse = 0.65 + (self.tick * 0.035 + particle.seed).sin() * 0.35;
            let alpha = particle.life.max(0.0) * particle.alpha * pulse;
            let offset = index * PARTICLE_STRIDE;
            self.output[offset] = prev_x;
            self.output[offset + 1] = prev_y;
            self.output[offset + 2] = particle.x;
            self.output[offset + 3] = particle.y;
            self.output[offset + 4] = particle.size;
            self.output[offset + 5] = particle.hue;
            self.output[offset + 6] = alpha;
        }

        self.output.as_ptr()
    }

    fn count(&self) -> u32 {
        self.particles.len() as u32
    }

    fn target_count(&self) -> usize {
        if self.width < 760.0 {
            ((self.width * self.height / 12_000.0).floor() as usize).clamp(54, 120)
        } else {
            ((self.width * self.height / 12_000.0).floor() as usize).clamp(96, 210)
        }
    }

    fn create_particle(&mut self, left_edge: bool) -> Particle {
        let hue = if self.next_unit() > 0.42 { 190.0 } else { 310.0 };
        let alpha = if hue == 310.0 {
            0.45 + self.next_unit() * 0.35
        } else {
            0.08 + self.next_unit() * 0.18
        };
        Particle {
            x: self.spawn_x(left_edge),
            y: self.next_unit() * self.height,
            life: 0.45 + self.next_unit() * 0.55,
            speed: 0.45 + self.next_unit() * 1.35,
            size: 0.45 + self.next_unit() * 1.05,
            seed: self.next_unit() * 200.0,
            hue,
            alpha,
        }
    }

    fn next_unit(&mut self) -> f32 {
        self.rng_state = self
            .rng_state
            .wrapping_mul(1_664_525)
            .wrapping_add(1_013_904_223);
        ((self.rng_state >> 8) as f32) / 16_777_216.0
    }

    fn spawn_x(&mut self, left_edge: bool) -> f32 {
        if left_edge {
            return -12.0;
        }

        let section = self.next_unit();
        if section < 0.24 {
            self.next_unit() * (self.width * 0.25)
        } else if section < 0.68 {
            self.width * 0.25 + self.next_unit() * (self.width * 0.5)
        } else {
            self.width * 0.75 + self.next_unit() * (self.width * 0.25)
        }
    }
}

thread_local! {
    static SIMULATION: RefCell<Simulation> = const { RefCell::new(Simulation::new()) };
}

#[unsafe(no_mangle)]
pub extern "C" fn backdrop_init(width: f32, height: f32) -> u32 {
    SIMULATION.with(|simulation| {
        let mut simulation = simulation.borrow_mut();
        simulation.resize(width, height);
        simulation.count()
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn backdrop_resize(width: f32, height: f32) -> u32 {
    backdrop_init(width, height)
}

#[unsafe(no_mangle)]
pub extern "C" fn backdrop_step(delta_ms: f32) -> *const f32 {
    SIMULATION.with(|simulation| simulation.borrow_mut().step(delta_ms))
}

#[unsafe(no_mangle)]
pub extern "C" fn backdrop_count() -> u32 {
    SIMULATION.with(|simulation| simulation.borrow().count())
}

fn noise2d(x: f32, y: f32) -> f32 {
    let value = (x * 12.9898 + y * 78.233).sin() * 43_758.547;
    value - value.floor()
}

fn smooth_noise(x: f32, y: f32) -> f32 {
    let ix = x.floor();
    let iy = y.floor();
    let fx = x - ix;
    let fy = y - iy;
    let a = noise2d(ix, iy);
    let b = noise2d(ix + 1.0, iy);
    let c = noise2d(ix, iy + 1.0);
    let d = noise2d(ix + 1.0, iy + 1.0);
    let ux = fx * fx * (3.0 - 2.0 * fx);
    let uy = fy * fy * (3.0 - 2.0 * fy);
    a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}
