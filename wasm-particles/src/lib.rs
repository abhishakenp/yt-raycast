use wasm_bindgen::prelude::*;
use rand::Rng;
use rand_chacha::ChaCha8Rng;
use rand::SeedableRng;
use std::f32::consts::PI;

#[repr(C)]
#[derive(Clone, Copy)]
pub struct Particle {
    pub x: f32,
    pub y: f32,
    pub vx: f32,
    pub vy: f32,
    pub life: f32,
    pub max_life: f32,
    pub size: f32,
    pub hue: f32,
    pub alpha: f32,
    pub seed: f32,
}

#[wasm_bindgen]
pub struct ParticleSystem {
    particles: Vec<Particle>,
    width: f32,
    height: f32,
    tick: u32,
    rng: ChaCha8Rng,
}

#[wasm_bindgen]
impl ParticleSystem {
    #[wasm_bindgen(constructor)]
    pub fn new(count: usize, width: f32, height: f32) -> ParticleSystem {
        let mut rng = ChaCha8Rng::from_entropy();
        let mut particles = Vec::with_capacity(count);
        
        for _ in 0..count {
            particles.push(Particle {
                x: rng.gen::<f32>() * width,
                y: rng.gen::<f32>() * height,
                vx: 0.0,
                vy: 0.0,
                life: 0.45 + rng.gen::<f32>() * 0.55,
                max_life: 1.0,
                size: 0.45 + rng.gen::<f32>() * 1.05,
                hue: if rng.gen::<f32>() > 0.42 { 190.0 } else { 310.0 },
                alpha: 0.0,
                seed: rng.gen::<f32>() * 200.0,
            });
        }
        
        ParticleSystem {
            particles,
            width,
            height,
            tick: 0,
            rng,
        }
    }
    
    pub fn update(&mut self, dt: f32) {
        self.tick += 1;
        let tick = self.tick as f32;
        
        for p in &mut self.particles {
            // Optimized noise calculation (simplified for performance)
            let noise_x = (p.x * 0.0036 + tick * 0.0007).sin() * 0.5 + 0.5;
            let _noise_y = (p.y * 0.0036 + p.seed).sin() * 0.5 + 0.5;
            let drift = (p.x * 0.0022).sin() * (p.y * 0.0022 + 50.0).sin();
            
            let angle = noise_x * PI * 5.4 - PI * 0.22;
            let speed = (0.45 + self.rng.gen::<f32>() * 1.35) * (0.75 + drift * 1.45);
            
            p.vx = angle.cos() * speed + 0.34;
            p.vy = angle.sin() * speed * 0.82;
            
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= 0.0011 * dt;
            
            // Reset particle if dead or out of bounds
            if p.life <= 0.0 || p.x < -40.0 || p.x > self.width + 40.0 || 
               p.y < -40.0 || p.y > self.height + 40.0 {
                p.x = if self.rng.gen::<f32>() > 0.35 { -12.0 } else { self.rng.gen::<f32>() * self.width };
                p.y = self.rng.gen::<f32>() * self.height;
                p.life = 0.45 + self.rng.gen::<f32>() * 0.55;
                p.seed = self.rng.gen::<f32>() * 200.0;
                p.hue = if self.rng.gen::<f32>() > 0.42 { 190.0 } else { 310.0 };
                p.alpha = if p.hue == 310.0 { 
                    0.45 + self.rng.gen::<f32>() * 0.35 
                } else { 
                    0.08 + self.rng.gen::<f32>() * 0.18 
                };
            }
            
            // Calculate alpha with pulse
            let pulse = 0.65 + (tick * 0.035 + p.seed).sin() * 0.35;
            p.alpha = p.life.max(0.0) * p.alpha * pulse;
        }
    }
    
    pub fn resize(&mut self, width: f32, height: f32) {
        self.width = width;
        self.height = height;
        
        // Adjust particle count based on screen size
        let target = ((width * height) / 12000.0) as usize;
        let target = target.max(54).min(210);
        
        while self.particles.len() < target {
            self.particles.push(Particle {
                x: self.rng.gen::<f32>() * width,
                y: self.rng.gen::<f32>() * height,
                vx: 0.0,
                vy: 0.0,
                life: 0.45 + self.rng.gen::<f32>() * 0.55,
                max_life: 1.0,
                size: 0.45 + self.rng.gen::<f32>() * 1.05,
                hue: if self.rng.gen::<f32>() > 0.42 { 190.0 } else { 310.0 },
                alpha: 0.0,
                seed: self.rng.gen::<f32>() * 200.0,
            });
        }
        
        self.particles.truncate(target);
    }
    
    #[wasm_bindgen(getter)]
    pub fn particles(&self) -> *const Particle {
        self.particles.as_ptr()
    }
    
    #[wasm_bindgen(getter)]
    pub fn particle_count(&self) -> usize {
        self.particles.len()
    }
}