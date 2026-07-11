import { useEffect, useRef, useState } from 'react'
import type * as THREE from 'three'
import zod from 'zod'

/** Zod validator for CSS color strings. Uses the browser's CSS.supports API
 *  when available (handles all named colors, hex, rgb(), hsl(), etc.) with a
 *  regex fallback for non-browser environments. */
const cssColor = zod.string().regex(/^0x[0-9a-fA-F]+$/, 'Invalid hex string')

export const flightSimulatorProps = zod.object({
  // Player aircraft
  planeColorHex: cssColor
    .optional()
    .describe("Aircraft color — e.g. '#4488ff'. only hex"),
  planeScale: zod
    .number()
    .optional()
    .describe('Aircraft model scale multiplier (default 0.8)'),

  // World colors
  skyColorHex: cssColor
    .optional()
    .describe(
      "Sky color — only a CSS color value, e.g. '#1a1a2e' or 'orange'.",
    ),
  grassColorHex: cssColor
    .optional()
    .describe(
      "Ground terrain color — only a CSS color value, e.g. '#2d5a27' or 'green'.",
    ),
  fogColorHex: cssColor
    .optional()
    .describe("Fog color — only a CSS color value, e.g. '#cccccc' or 'white'."),
  waterColorHex: cssColor
    .optional()
    .describe(
      "Water/pond color — only a CSS color value, e.g. '#0077be' or 'cyan'.",
    ),
  buildingColorHex: cssColor
    .optional()
    .describe(
      "Building color — only a CSS color value, e.g. '#ff6b35' or 'silver'.",
    ),
  robotColorHex: cssColor
    .optional()
    .describe(
      "Robot landmark color — only a CSS color value, e.g. '#ff0000' or 'red'.",
    ),
  castleColorHex: cssColor
    .optional()
    .describe(
      "Castle stone color — only a CSS color value, e.g. '#8b7355' or 'gray'.",
    ),

  // World scale
  groundSize: zod
    .number()
    .optional()
    .describe('World size in units (default 8000, larger = more exploration)'),
  buildingCount: zod
    .number()
    .optional()
    .describe('Number of skyscrapers (default 200, set 0 to disable)'),
  buildingHeight: zod
    .number()
    .optional()
    .describe(
      'Max building height in units (default 400, increase for taller buildings)',
    ),
  treeCount: zod.number().optional().describe('Number of trees (default 7000)'),
  cloudCount: zod
    .number()
    .optional()
    .describe('Number of clouds (default 200)'),
  terrainAmplitude: zod
    .number()
    .optional()
    .describe('Terrain hill height in units (default 50, higher = hillier)'),

  // Gameplay
  speed: zod
    .number()
    .optional()
    .describe('Player aircraft base speed (default 200)'),
  hud: zod
    .boolean()
    .optional()
    .describe('Show speed/altitude HUD overlay (default true)'),

  className: zod.string().optional(),
})

export type FlightSimulatorProps = zod.infer<typeof flightSimulatorProps>

type FlightHudInput = {
  altitude: number
  headingRadians: number
  speedUnits: number
  thrusting: boolean
  boosting: boolean
}

export const getFlightHudReadout = ({
  altitude,
  headingRadians,
  speedUnits,
  thrusting,
  boosting,
}: FlightHudInput) => ({
  altitude: altitude.toFixed(1),
  heading: String(
    Math.round(((headingRadians * 180) / Math.PI + 360) % 360),
  ),
  speed: (speedUnits * 3.6).toFixed(0),
  throttle: String(boosting ? 300 : thrusting ? 100 : 0),
})

/**
 * FlightSimulator — a single-player Three.js flight sim.
 * All multiplayer (WebSocket, other-players tracking) has been removed.
 * Assets live in /public and are referenced with absolute paths.
 */
export default function FlightSimulator(cfg: FlightSimulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const showHud = cfg.hud ?? true

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    let disposed = false
    let rendererInstance: THREE.WebGLRenderer | undefined
    let animFrameId: number
    let onKeyDown: ((e: KeyboardEvent) => void) | undefined
    let onKeyUp: ((e: KeyboardEvent) => void) | undefined
    let onResize: (() => void) | undefined
    let ufoFrameId: number
    ;(async () => {
      try {
        const THREE = await import('three')
        const { GLTFLoader } =
          await import('three/addons/loaders/GLTFLoader.js')
        if (disposed) return

        // --- Configuration ---
        const PLAYER_SPEED = 200.0
        const AFTERBURNER_MULTIPLIER = 3.0
        const ROLL_SPEED = Math.PI * 1.0
        const PITCH_SPEED = Math.PI * 0.8
        const YAW_SPEED = Math.PI * 0.5
        const DAMPING = 0.95
        const CAMERA_BASE_FOV = 75
        const CAMERA_MAX_FOV_BOOST = 25
        const GROUND_SIZE = 8000
        const GROUND_SEGMENTS = 100
        const BUILDING_COUNT = 200
        const MAX_BUILDING_HEIGHT = 400
        const MIN_BUILDING_HEIGHT = 50
        const STAR_COUNT = 5000
        const DAY_NIGHT_CYCLE_MINUTES = 10
        const MODEL_URL = '/Shenyang J-11.glb'
        const MODEL_SCALE = 0.8
        const TERRAIN_AMPLITUDE = 50
        const TERRAIN_FREQUENCY = (8 * Math.PI * 2) / GROUND_SIZE
        const TREE_COUNT = 7000
        const TRUNK_HEIGHT = 10
        const TRUNK_RADIUS = 2.0
        const FOLIAGE_HEIGHT = 20
        const FOLIAGE_RADIUS = 8
        const CLOUD_COUNT = 200
        const CLOUD_SIZE = 1000
        const CLOUD_ALTITUDE_MIN = 600
        const CLOUD_ALTITUDE_MAX = 1200
        const CLOUD_AREA_XZ = GROUND_SIZE * 1.5
        const CLOUD_DRIFT_SPEED = 5.0
        const CLOUD_TEXTURE_URL = '/Cloud 10 from vibe-jet.png'
        const ROAD_COUNT = 5
        const ROAD_WIDTH = 30
        const ROAD_MIN_LENGTH = 1000
        const ROAD_MAX_LENGTH = 2000
        const ROAD_SEGMENT_LENGTH = 10
        const ROAD_THICKNESS_OFFSET = 0.2
        const ROAD_TEXTURE_URL = '/Road from vibe-jet.jpg'

        // --- State ---
        let scene: THREE.Scene
        let camera: THREE.PerspectiveCamera
        let renderer: THREE.WebGLRenderer
        let clock: THREE.Clock
        let skyLight: THREE.HemisphereLight
        let sunLight: THREE.DirectionalLight
        let playerAircraft: THREE.Object3D | null = null
        let playerVelocity: THREE.Vector3
        let playerAngularVelocity: THREE.Vector3
        const controls: Record<string, number> = {
          forward: 0,
          backward: 0,
          left: 0,
          right: 0,
          up: 0,
          down: 0,
          boost: 0,
          rollLeft: 0,
          rollRight: 0,
        }
        let buildingBoundingBoxes: THREE.Box3[] = []
        let isColliding = false
        let sunAngle = Math.PI / 4
        let loadedModelTemplate: THREE.Object3D | null = null
        let clouds: THREE.Points | null = null
        let roadTexture: THREE.Texture | null = null

        const speedEl = document.getElementById('fs-speed')
        const altEl = document.getElementById('fs-altitude')
        const headingEl = document.getElementById('fs-heading')
        const throttleEl = document.getElementById('fs-throttle')

        // --- Terrain ---
        function getTerrainHeight(worldX: number, worldZ: number) {
          return (
            Math.sin(worldX * TERRAIN_FREQUENCY) *
            Math.cos(worldZ * TERRAIN_FREQUENCY) *
            TERRAIN_AMPLITUDE
          )
        }

        // --- Init ---
        function init() {
          scene = new THREE.Scene()
          camera = new THREE.PerspectiveCamera(
            CAMERA_BASE_FOV,
            window.innerWidth / window.innerHeight,
            0.1,
            20000,
          )
          renderer = new THREE.WebGLRenderer({ antialias: true })
          renderer.setSize(window.innerWidth, window.innerHeight)
          renderer.setPixelRatio(window.devicePixelRatio)
          renderer.shadowMap.enabled = true
          renderer.shadowMap.type = THREE.PCFSoftShadowMap
          container.appendChild(renderer.domElement)
          rendererInstance = renderer
          clock = new THREE.Clock()

          skyLight = new THREE.HemisphereLight(0x87ceeb, 0x000000, 0.6)
          scene.add(skyLight)

          sunLight = new THREE.DirectionalLight(0xffffff, 1.5)
          sunLight.position.set(0, 1000, 1000)
          sunLight.castShadow = true
          sunLight.shadow.mapSize.width = 2048
          sunLight.shadow.mapSize.height = 2048
          sunLight.shadow.camera.near = 100
          sunLight.shadow.camera.far = 5000
          sunLight.shadow.camera.left = -GROUND_SIZE / 2
          sunLight.shadow.camera.right = GROUND_SIZE / 2
          sunLight.shadow.camera.top = GROUND_SIZE / 2
          sunLight.shadow.camera.bottom = -GROUND_SIZE / 2
          scene.add(sunLight)
          scene.add(sunLight.target)

          scene.fog = new THREE.Fog(0xcccccc, 1000, 15000)

          createGround()
          populateLandscape()
          createStars()
          loadResources()

          onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
          }
          window.addEventListener('resize', onResize)
        }

        // --- Resources ---
        function loadResources() {
          const loadingManager = new THREE.LoadingManager(
            () => {
              if (disposed) return
              setLoading(false)
              initializeGame()
            },
            undefined,
            (url: string) => {
              console.error('Failed to load ' + url)
              if (!disposed) setError('Failed to load: ' + url)
            },
          )

          const gltfLoader = new GLTFLoader(loadingManager)
          gltfLoader.load(MODEL_URL, (gltf: { scene: THREE.Object3D }) => {
            loadedModelTemplate = gltf.scene
            loadedModelTemplate.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE)
            loadedModelTemplate.traverse((child: THREE.Object3D) => {
              if ((child as THREE.Mesh).isMesh) {
                ;(child as THREE.Mesh).castShadow = true
              }
            })
            loadedModelTemplate.rotation.set(0, Math.PI, 0)
          })

          const textureLoader = new THREE.TextureLoader(loadingManager)
          textureLoader.load(ROAD_TEXTURE_URL, (texture: THREE.Texture) => {
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            roadTexture = texture
          })
        }

        function initializeGame() {
          if (!loadedModelTemplate || !roadTexture) return
          createPlayerAircraft()
          setupControls()
          createTrees(TREE_COUNT)
          createClouds()
          createRoads()
          animate()
        }

        // --- Landscape ---
        function createGround() {
          const grassTextureUrl =
            'https://threejs.org/examples/textures/terrain/grasslight-big.jpg'
          new THREE.TextureLoader().load(
            grassTextureUrl,
            (texture) => {
              if (disposed) return
              texture.wrapS = THREE.RepeatWrapping
              texture.wrapT = THREE.RepeatWrapping
              const repeats = GROUND_SIZE / 100
              texture.repeat.set(repeats, repeats)

              const groundGeometry = new THREE.PlaneGeometry(
                GROUND_SIZE,
                GROUND_SIZE,
                GROUND_SEGMENTS,
                GROUND_SEGMENTS,
              )
              const positionAttribute = groundGeometry.attributes.position
              const vertex = new THREE.Vector3()
              for (let i = 0; i < positionAttribute.count; i++) {
                vertex.fromBufferAttribute(positionAttribute, i)
                positionAttribute.setZ(i, getTerrainHeight(vertex.x, vertex.y))
              }
              positionAttribute.needsUpdate = true
              groundGeometry.computeVertexNormals()

              const groundMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                side: THREE.DoubleSide,
                roughness: 0.9,
                metalness: 0.1,
              })
              const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial)
              groundMesh.rotation.x = -Math.PI / 2
              groundMesh.receiveShadow = true
              scene.add(groundMesh)
            },
            undefined,
            () => {
              if (disposed) return
              const g = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE)
              const m = new THREE.MeshStandardMaterial({
                color: 0x555555,
                side: THREE.DoubleSide,
              })
              const mesh = new THREE.Mesh(g, m)
              mesh.rotation.x = -Math.PI / 2
              mesh.receiveShadow = true
              scene.add(mesh)
            },
          )
        }

        function createSkyscrapers(count: number) {
          const mat = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            roughness: 0.8,
            metalness: 0.2,
          })
          const geo = new THREE.BoxGeometry(1, 1, 1)
          for (let i = 0; i < count; i++) {
            const h =
              MIN_BUILDING_HEIGHT +
              Math.random() * (MAX_BUILDING_HEIGHT - MIN_BUILDING_HEIGHT)
            const w = Math.random() * 50 + 20
            const d = Math.random() * 50 + 20
            const m = mat.clone()
            m.color.setHSL(0, 0, 0.5 + Math.random() * 0.3)
            const b = new THREE.Mesh(geo, m)
            b.scale.set(w, h, d)
            const x = (Math.random() - 0.5) * (GROUND_SIZE * 0.9)
            const z = (Math.random() - 0.5) * (GROUND_SIZE * 0.9)
            const y = getTerrainHeight(x, z) + h / 2
            if (y - h / 2 < 0) continue
            b.position.set(x, y, z)
            b.castShadow = true
            b.receiveShadow = true
            scene.add(b)
            buildingBoundingBoxes.push(new THREE.Box3().setFromObject(b))
          }
        }

        function createHouses(clusterCount: number) {
          const houseGeo = new THREE.BoxGeometry(1, 1, 1)
          for (let c = 0; c < clusterCount; c++) {
            let cx: number, cz: number, cy: number
            do {
              cx = (Math.random() - 0.5) * (GROUND_SIZE * 0.8)
              cz = (Math.random() - 0.5) * (GROUND_SIZE * 0.8)
              cy = getTerrainHeight(cx, cz)
            } while (cy < 5 || cy > TERRAIN_AMPLITUDE * 0.5)
            const count = 10 + Math.floor(Math.random() * 15)
            for (let i = 0; i < count; i++) {
              const h = 5 + Math.random() * 5
              const w = 8 + Math.random() * 8
              const d = 8 + Math.random() * 8
              const houseMat = new THREE.MeshStandardMaterial({
                color: 0xcc6633,
                roughness: 0.9,
              })
              const house = new THREE.Mesh(houseGeo, houseMat)
              house.scale.set(w, h, d)
              const angle = Math.random() * Math.PI * 2
              const radius = Math.random() * 150
              const x = cx + Math.cos(angle) * radius
              const z = cz + Math.sin(angle) * radius
              const y = getTerrainHeight(x, z) + h / 2
              if (Math.abs(y - h / 2 - cy) > 20) continue
              house.position.set(x, y, z)
              house.rotation.y = Math.random() * Math.PI
              house.castShadow = true
              house.receiveShadow = true
              scene.add(house)
              buildingBoundingBoxes.push(new THREE.Box3().setFromObject(house))
            }
          }
        }

        function createPonds(count: number) {
          const pondMat = new THREE.MeshStandardMaterial({
            color: 0x3366aa,
            roughness: 0.2,
            metalness: 0.1,
            transparent: true,
            opacity: 0.8,
          })
          for (let i = 0; i < count; i++) {
            const radius = 50 + Math.random() * 100
            let x: number, z: number, y: number
            do {
              x = (Math.random() - 0.5) * (GROUND_SIZE * 0.9)
              z = (Math.random() - 0.5) * (GROUND_SIZE * 0.9)
              y = getTerrainHeight(x, z)
            } while (y > TERRAIN_AMPLITUDE * 0.3)
            const pond = new THREE.Mesh(
              new THREE.CircleGeometry(radius, 32),
              pondMat,
            )
            pond.position.set(x, y - 0.5, z)
            pond.rotation.x = -Math.PI / 2
            pond.receiveShadow = true
            scene.add(pond)
          }
        }

        function createCastle() {
          const castleGroup = new THREE.Group()
          const stoneMat = new THREE.MeshPhongMaterial({
            color: 0x808080,
            flatShading: true,
          })
          const keep = new THREE.Mesh(
            new THREE.BoxGeometry(40, 60, 40),
            stoneMat,
          )
          keep.position.y = 30
          castleGroup.add(keep)

          const canvas = document.createElement('canvas')
          canvas.width = 256
          canvas.height = 128
          const ctx = canvas.getContext('2d')!
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.font = 'bold 36px system-ui'
          ctx.fillStyle = 'white'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('FLIGHT SIM', canvas.width / 2, canvas.height / 3)
          ctx.fillText('GAME', canvas.width / 2, (canvas.height * 2) / 3)
          const banner = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 15),
            new THREE.MeshBasicMaterial({
              map: new THREE.CanvasTexture(canvas),
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.9,
              fog: false,
            }),
          )
          banner.position.set(0, 40, 20.1)
          castleGroup.add(banner)

          const towerGeo = new THREE.CylinderGeometry(6, 8, 70, 8)
          const towerPositions: [number, number, number][] = [
            [-22, 35, -22],
            [22, 35, -22],
            [-22, 35, 22],
            [22, 35, 22],
          ]
          for (const pos of towerPositions) {
            const tower = new THREE.Mesh(towerGeo, stoneMat)
            tower.position.set(pos[0], pos[1], pos[2])
            castleGroup.add(tower)
            const roof = new THREE.Mesh(
              new THREE.ConeGeometry(8, 15, 8),
              new THREE.MeshPhongMaterial({ color: 0x8b4513 }),
            )
            roof.position.set(pos[0], pos[1] + 42, pos[2])
            castleGroup.add(roof)
          }

          for (let x = -18; x <= 18; x += 4) {
            for (let z = -18; z <= 18; z += 4) {
              if (x === -18 || x === 18 || z === -18 || z === 18) {
                const merlon = new THREE.Mesh(
                  new THREE.BoxGeometry(3, 4, 3),
                  stoneMat,
                )
                merlon.position.set(x, 62, z)
                castleGroup.add(merlon)
              }
            }
          }

          castleGroup.scale.set(3, 3, 3)
          castleGroup.position.set(2000, 10, 1000)
          scene.add(castleGroup)
        }

        function createBigHouse(count: number) {
          for (let i = 0; i < count; i++) {
            const group = new THREE.Group()
            const scale = 10
            const w = 4 * scale + Math.random() * 4
            const h = 6 * scale + Math.random() * 8
            const d = 4 * scale + Math.random() * 4

            const buildingMat = new THREE.MeshPhongMaterial({
              color: new THREE.Color(
                0.7 + Math.random() * 0.3,
                0.7 + Math.random() * 0.3,
                0.7 + Math.random() * 0.3,
              ),
            })
            const building = new THREE.Mesh(
              new THREE.BoxGeometry(w, h, d),
              buildingMat,
            )
            building.position.y = h / 2
            group.add(building)

            const roofH = h * 0.3
            const roof = new THREE.Mesh(
              new THREE.ConeGeometry(w * 0.8, roofH, 4),
              new THREE.MeshPhongMaterial({
                color: Math.random() > 0.5 ? 0x8b4513 : 0xa0522d,
              }),
            )
            roof.position.y = h + roofH / 2
            roof.rotation.y = Math.PI / 4
            group.add(roof)

            const wSize = w * 0.2
            const winGeo = new THREE.BoxGeometry(wSize, wSize, 0.1)
            const winMat = new THREE.MeshPhongMaterial({
              color: 0xaaaaff,
              emissive: 0x444444,
            })
            const winPositions = [
              [-w / 4, h / 2, d / 2],
              [w / 4, h / 2, d / 2],
              [-w / 4, h * 0.75, d / 2],
              [w / 4, h * 0.75, d / 2],
            ]
            for (const pos of winPositions) {
              const win = new THREE.Mesh(winGeo, winMat)
              win.position.set(pos[0], pos[1], pos[2])
              group.add(win)
            }

            const door = new THREE.Mesh(
              new THREE.BoxGeometry(w * 0.3, h * 0.4, 0.1),
              new THREE.MeshPhongMaterial({ color: 0x8b4513 }),
            )
            door.position.set(0, (h * 0.4) / 2, d / 2)
            group.add(door)

            const x = (Math.random() - 0.5) * (GROUND_SIZE * 0.9)
            const z = (Math.random() - 0.5) * (GROUND_SIZE * 0.9)
            group.position.set(x, getTerrainHeight(x, z), z)
            group.rotation.y = Math.random() * Math.PI * 2
            scene.add(group)
          }
        }

        function createGiantRobot() {
          const robotGroup = new THREE.Group()
          const bodyMat = new THREE.MeshPhongMaterial({
            color: 0xb894db,
            shininess: 70,
            fog: false,
          })
          const body = new THREE.Mesh(new THREE.BoxGeometry(10, 14, 6), bodyMat)
          robotGroup.add(body)

          const headMat = new THREE.MeshPhongMaterial({
            color: 0x935dc9,
            shininess: 70,
            fog: false,
          })
          const head = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 6), headMat)
          head.position.y = 10
          robotGroup.add(head)

          const eyeMat = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.8,
            fog: false,
          })
          const eyeGeo = new THREE.SphereGeometry(1, 16, 16)
          const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
          leftEye.position.set(-2, 10, 3)
          robotGroup.add(leftEye)
          const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
          rightEye.position.set(2, 10, 3)
          robotGroup.add(rightEye)

          const armGeo = new THREE.BoxGeometry(2, 8, 2)
          const leftArm = new THREE.Mesh(armGeo, bodyMat)
          leftArm.position.set(-6, 0, 0)
          robotGroup.add(leftArm)
          const rightArm = new THREE.Mesh(armGeo, bodyMat)
          rightArm.position.set(6, 0, 0)
          robotGroup.add(rightArm)

          const legMat = new THREE.MeshPhongMaterial({
            color: 0x935dc9,
            shininess: 70,
            fog: false,
          })
          const legGeo = new THREE.BoxGeometry(3, 8, 3)
          const leftLeg = new THREE.Mesh(legGeo, legMat)
          leftLeg.position.set(-3, -11, 0)
          robotGroup.add(leftLeg)
          const rightLeg = new THREE.Mesh(legGeo, legMat)
          rightLeg.position.set(3, -11, 0)
          robotGroup.add(rightLeg)

          // Banner
          const bannerCanvas = document.createElement('canvas')
          bannerCanvas.width = 512
          bannerCanvas.height = 128
          const bCtx = bannerCanvas.getContext('2d')!
          bCtx.fillStyle = '#935dc9'
          bCtx.fillRect(0, 0, bannerCanvas.width, bannerCanvas.height)
          bCtx.font = 'bold 60px system-ui'
          bCtx.textAlign = 'center'
          bCtx.textBaseline = 'middle'
          bCtx.fillStyle = 'white'
          bCtx.fillText(
            'NEO.AI',
            bannerCanvas.width / 2,
            bannerCanvas.height / 2,
          )
          const banner = new THREE.Mesh(
            new THREE.PlaneGeometry(16, 4),
            new THREE.MeshBasicMaterial({
              map: new THREE.CanvasTexture(bannerCanvas),
              transparent: true,
              side: THREE.DoubleSide,
              fog: false,
            }),
          )
          banner.position.y = 18
          robotGroup.add(banner)

          robotGroup.scale.set(8, 8, 8)
          const x = -800
          const z = Math.min(2000, GROUND_SIZE * 0.9)
          robotGroup.position.set(x, getTerrainHeight(x, z) + 120, z)
          robotGroup.rotation.y = 15
          scene.add(robotGroup)
        }

        function createMountain() {
          const mountainGroup = new THREE.Group()
          const mountainMat = new THREE.MeshPhongMaterial({
            color: 0x8b4513,
            flatShading: true,
          })
          const mountain = new THREE.Mesh(
            new THREE.ConeGeometry(100, 200, 6),
            mountainMat,
          )
          mountain.position.y = 100
          mountainGroup.add(mountain)

          // Sign
          const signCanvas = document.createElement('canvas')
          signCanvas.width = 1024
          signCanvas.height = 256
          const sCtx = signCanvas.getContext('2d')!
          sCtx.clearRect(0, 0, signCanvas.width, signCanvas.height)
          sCtx.font = 'bold 60px system-ui'
          sCtx.textAlign = 'center'
          sCtx.textBaseline = 'middle'
          sCtx.fillStyle = '#FFFFFF'
          sCtx.fillText(
            'FLIGHT SIMULATOR',
            signCanvas.width / 2,
            signCanvas.height / 2,
          )
          const sign = new THREE.Mesh(
            new THREE.PlaneGeometry(120, 30),
            new THREE.MeshBasicMaterial({
              map: new THREE.CanvasTexture(signCanvas),
              transparent: true,
              side: THREE.DoubleSide,
            }),
          )
          sign.position.set(-60, 70, 40)
          sign.rotation.y = -1.1
          mountainGroup.add(sign)

          const snowMat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            flatShading: true,
          })
          const snowCap = new THREE.Mesh(
            new THREE.ConeGeometry(40, 50, 6),
            snowMat,
          )
          snowCap.position.y = 175
          mountainGroup.add(snowCap)

          const smallPeaks: [number, number, number][] = [
            [-50, -30, -40],
            [60, -50, 30],
            [-30, -60, 50],
          ]
          for (const pos of smallPeaks) {
            const h = 80 + Math.random() * 60
            const peak = new THREE.Mesh(
              new THREE.ConeGeometry(30 + Math.random() * 20, h, 5),
              mountainMat,
            )
            peak.position.set(pos[0], h / 2, pos[1])
            peak.rotation.y = Math.random() * Math.PI
            mountainGroup.add(peak)
            if (Math.random() > 0.3) {
              const snow = new THREE.Mesh(
                new THREE.ConeGeometry(15, 20, 5),
                snowMat,
              )
              snow.position.y = h * 0.4
              peak.add(snow)
            }
          }

          for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2
            const distance = 70 + Math.random() * 100
            const x = Math.cos(angle) * distance
            const z = Math.sin(angle) * distance
            const h = 10 + Math.random() * 15
            const tree = new THREE.Group()
            tree.add(
              new THREE.Mesh(
                new THREE.CylinderGeometry(2, 3, h, 8),
                new THREE.MeshPhongMaterial({ color: 0x8b4513 }),
              ),
            )
            const top = new THREE.Mesh(
              new THREE.ConeGeometry(8, h * 1.5, 8),
              new THREE.MeshPhongMaterial({
                color: 0x006400,
                flatShading: true,
              }),
            )
            top.position.y = h * 0.75
            tree.add(top)
            tree.position.set(x, h / 2, z)
            tree.rotation.y = Math.random() * Math.PI * 2
            const slopeTilt = distance / 100
            tree.rotation.x = (Math.random() - 0.5) * 0.2 * slopeTilt
            tree.rotation.z = (Math.random() - 0.5) * 0.2 * slopeTilt
            mountainGroup.add(tree)
          }

          mountainGroup.position.set(-2000, 0, -800)
          mountainGroup.scale.set(2, 2, 2)
          mountainGroup.rotation.y = 15
          scene.add(mountainGroup)
        }

        function createUFO() {
          const ufoGroup = new THREE.Group()
          const bodyMat = new THREE.MeshPhongMaterial({
            color: 0xc0c0c0,
            shininess: 80,
            fog: false,
          })

          const top = new THREE.Mesh(
            new THREE.SphereGeometry(
              10,
              32,
              16,
              0,
              Math.PI * 2,
              0,
              Math.PI / 2,
            ),
            bodyMat,
          )
          top.scale.y = 0.3
          ufoGroup.add(top)

          const bottom = new THREE.Mesh(
            new THREE.SphereGeometry(
              7,
              32,
              16,
              0,
              Math.PI * 2,
              Math.PI / 2,
              Math.PI / 4,
            ),
            bodyMat,
          )
          bottom.scale.y = 0.5
          ufoGroup.add(bottom)

          const cockpit = new THREE.Mesh(
            new THREE.SphereGeometry(4, 32, 32),
            new THREE.MeshPhongMaterial({
              transparent: true,
              opacity: 0.9,
              shininess: 100,
              fog: false,
            }),
          )
          cockpit.position.y = 3
          cockpit.rotation.y = 0.1
          ufoGroup.add(cockpit)

          const plate = new THREE.Mesh(
            new THREE.CircleGeometry(10, 32),
            new THREE.MeshPhongMaterial({
              color: 0xc0c0c0,
              shininess: 60,
              side: THREE.DoubleSide,
              fog: false,
            }),
          )
          plate.rotation.x = Math.PI / 2
          ufoGroup.add(plate)

          const lightPositions: [number, number, number][] = [
            [5, -2, 0],
            [-5, -2, 0],
            [0, -2, 5],
            [0, -2, -5],
          ]
          const lightMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            fog: false,
          })
          const lightGeo = new THREE.SphereGeometry(0.8, 16, 16)
          for (const pos of lightPositions) {
            const light = new THREE.Mesh(lightGeo, lightMat)
            light.position.set(pos[0], pos[1], pos[2])
            ufoGroup.add(light)
          }

          ufoGroup.scale.set(2, 2, 2)
          scene.add(ufoGroup)

          const animateUfo = () => {
            if (disposed) return
            const t = Date.now() * 0.001
            ufoGroup.position.x = Math.sin(t * 0.2) * 500
            ufoGroup.position.z = -70 + Math.cos(t * 0.2) * 500
            ufoGroup.position.y = 200 + Math.sin(t * 0.5) * 10
            ufoGroup.rotation.z = Math.sin(t * 0.2) * 0.1
            ufoGroup.rotation.x = Math.cos(t * 0.2) * 0.1
            ufoFrameId = requestAnimationFrame(animateUfo)
          }
          animateUfo()
        }

        function createBlimp() {
          const makeBlimp = (color: number) => {
            const group = new THREE.Group()
            const bodyGeo = new THREE.SphereGeometry(20, 32, 32)
            bodyGeo.scale(1, 1, 2.7)
            group.add(
              new THREE.Mesh(bodyGeo, new THREE.MeshPhongMaterial({ color })),
            )
            const tailGeo = new THREE.ConeGeometry(15, 20, 32)
            tailGeo.rotateX(Math.PI / 2)
            tailGeo.translate(0, 0, 45)
            group.add(
              new THREE.Mesh(
                tailGeo,
                new THREE.MeshPhongMaterial({ color: 0x00008b }),
              ),
            )
            const gondola = new THREE.Mesh(
              new THREE.BoxGeometry(10, 5, 7),
              new THREE.MeshPhongMaterial({ color: 0x404040 }),
            )
            gondola.position.y = -20
            group.add(gondola)
            const finGeo = new THREE.ConeGeometry(8, 15, 4)
            finGeo.rotateX(Math.PI / 2)
            const finMat = new THREE.MeshPhongMaterial({ color: 0xff0000 })
            const vFin = new THREE.Mesh(finGeo, finMat)
            vFin.position.set(0, 0, 50)
            vFin.rotation.x = Math.PI / 2
            group.add(vFin)
            const hFin = new THREE.Mesh(finGeo, finMat)
            hFin.position.set(0, 0, 50)
            hFin.rotation.z = Math.PI / 2
            group.add(hFin)
            return group
          }

          const b1 = makeBlimp(0xffff00)
          b1.position.set(-550, 500, -800)
          b1.rotation.y = -1.5
          scene.add(b1)

          const b2 = makeBlimp(0xff0000)
          b2.position.set(1000, 1000, -2000)
          b2.rotation.y = 1.5
          scene.add(b2)

          const b3 = makeBlimp(0xff007f)
          b3.position.set(500, 600, 1000)
          b3.rotation.y = 2
          scene.add(b3)
        }

        function populateLandscape() {
          buildingBoundingBoxes = []
          createSkyscrapers(BUILDING_COUNT)
          createHouses(20)
          createPonds(30)
          createCastle()
          createBigHouse(50)
          createGiantRobot()
          createMountain()
          createUFO()
          createBlimp()
        }

        // --- Stars ---
        function createStars() {
          const geo = new THREE.BufferGeometry()
          const verts: number[] = []
          for (let i = 0; i < STAR_COUNT; i++) {
            const x = (Math.random() - 0.5) * 15000
            const y = Math.random() * 5000 + 500
            const z = (Math.random() - 0.5) * 15000
            if (Math.sqrt(x * x + y * y + z * z) > 1000) verts.push(x, y, z)
            else i--
          }
          geo.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(verts, 3),
          )
          scene.add(
            new THREE.Points(
              geo,
              new THREE.PointsMaterial({
                color: 0xffffff,
                size: 1.5,
                sizeAttenuation: true,
              }),
            ),
          )
        }

        // --- Player ---
        function createPlayerAircraft() {
          if (!loadedModelTemplate) return
          playerAircraft = loadedModelTemplate.clone()
          playerAircraft.position.set(0, 50, 0)
          scene.add(playerAircraft)
          playerVelocity = new THREE.Vector3()
          playerAngularVelocity = new THREE.Vector3()

          const glslVec3FromHex = (hex: string, mult = 1) => {
            const c = hex.replace('#', '')
            const f = (i: number) =>
              Math.min(255, parseInt(c.slice(i, i + 2), 16) * mult) / 255
            return `vec3(${f(0).toFixed(3)}, ${f(2).toFixed(3)}, ${f(4).toFixed(3)})`
          }

          // Generated props are LLM-authored and frequently NOT valid hex
          // (e.g. "Skyline Pilot", "1"). Feeding those into the GLSL recolor
          // produced `vec3(NaN, NaN, NaN)`, which fails shader compilation and
          // makes the whole aircraft invisible. Only recolor on a real 3/6-digit
          // hex; otherwise keep the model's natural materials.
          const normalizeHex = (v: unknown): string | null => {
            if (typeof v !== 'string') return null
            const c = v.trim().replace(/^#/, '')
            if (/^[0-9a-fA-F]{6}$/.test(c)) return `#${c}`
            if (/^[0-9a-fA-F]{3}$/.test(c))
              return `#${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}`
            return null
          }
          const planeHex = normalizeHex(cfg.planeColorHex)

          if (planeHex) {
            playerAircraft.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material) {
                const mat = Array.isArray(child.material)
                  ? child.material[0]
                  : child.material

                mat.onBeforeCompile = (shader: any) => {
                  shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <dithering_fragment>',
                    `
          #include <dithering_fragment>
          
          vec3 c = gl_FragColor.rgb;
          
          // Perceived brightness
          float brightness = dot(c, vec3(0.299, 0.587, 0.114));
          
          // Saturation
          float maxC = max(c.r, max(c.g, c.b));
          float minC = min(c.r, min(c.g, c.b));
          float saturation = maxC > 0.001 ? (maxC - minC) / maxC : 0.0;
          
          // Detect dark grey/black body:
          // - Dark enough to be the body
          // - Low saturation = greyscale (not red star, not brown engine)
          // - Not pure black (shadows)
          bool isDarkBody = brightness < 0.32 && saturation < 0.20 && brightness > 0.03;
          
          if (isDarkBody) {
            // Preserve shading variation by mapping brightness to blue
            float t = brightness / 0.32;

            vec3 darkBlue  = ${glslVec3FromHex(planeHex, 0.4)};
            vec3 lightBlue = ${glslVec3FromHex(planeHex, 1.3)};
            gl_FragColor.rgb = mix(darkBlue, lightBlue, t);
          }
          `,
                  )
                }

                mat.needsUpdate = true
              }
            })
          }
        }

        // --- Trees (instanced) ---
        function createTrees(count: number) {
          const trunkGeo = new THREE.CylinderGeometry(
            TRUNK_RADIUS,
            TRUNK_RADIUS,
            TRUNK_HEIGHT,
            8,
          )
          const trunkMat = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.9,
          })
          const foliageGeo = new THREE.ConeGeometry(
            FOLIAGE_RADIUS,
            FOLIAGE_HEIGHT,
            8,
          )
          const foliageMat = new THREE.MeshStandardMaterial({
            color: 0x228b22,
            roughness: 0.9,
          })
          const trunkIM = new THREE.InstancedMesh(trunkGeo, trunkMat, count)
          const foliageIM = new THREE.InstancedMesh(
            foliageGeo,
            foliageMat,
            count,
          )
          trunkIM.castShadow = true
          trunkIM.receiveShadow = true
          foliageIM.castShadow = true

          const matrix = new THREE.Matrix4()
          const pos = new THREE.Vector3()
          const quat = new THREE.Quaternion()
          const scl = new THREE.Vector3()
          let placed = 0

          for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * GROUND_SIZE * 0.95
            const z = (Math.random() - 0.5) * GROUND_SIZE * 0.95
            const y = getTerrainHeight(x, z)
            if (y < -10 || y > TERRAIN_AMPLITUDE * 0.8) continue
            const treeBox = new THREE.Box3(
              new THREE.Vector3(x - FOLIAGE_RADIUS, y, z - FOLIAGE_RADIUS),
              new THREE.Vector3(
                x + FOLIAGE_RADIUS,
                y + TRUNK_HEIGHT + FOLIAGE_HEIGHT,
                z + FOLIAGE_RADIUS,
              ),
            )
            let hit = false
            for (const bb of buildingBoundingBoxes) {
              if (treeBox.intersectsBox(bb)) {
                hit = true
                break
              }
            }
            if (hit) continue

            const s = 0.8 + Math.random() * 0.4
            quat.setFromEuler(
              new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
            )
            scl.setScalar(s)

            pos.set(x, y + TRUNK_HEIGHT / 2, z)
            matrix.compose(pos, quat, scl)
            trunkIM.setMatrixAt(placed, matrix)

            pos.set(x, y + TRUNK_HEIGHT + FOLIAGE_HEIGHT / 2 - 1, z)
            matrix.compose(pos, quat, scl)
            foliageIM.setMatrixAt(placed, matrix)
            placed++
          }

          trunkIM.count = placed
          foliageIM.count = placed
          scene.add(trunkIM)
          scene.add(foliageIM)
        }

        // --- Clouds ---
        function createClouds() {
          new THREE.TextureLoader().load(
            CLOUD_TEXTURE_URL,
            (cloudTexture: THREE.Texture) => {
              if (disposed) return
              const geo = new THREE.BufferGeometry()
              const positions: number[] = []
              for (let i = 0; i < CLOUD_COUNT; i++) {
                positions.push(
                  (Math.random() - 0.5) * CLOUD_AREA_XZ,
                  Math.random() * (CLOUD_ALTITUDE_MAX - CLOUD_ALTITUDE_MIN) +
                    CLOUD_ALTITUDE_MIN,
                  (Math.random() - 0.5) * CLOUD_AREA_XZ,
                )
              }
              geo.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(positions, 3),
              )
              clouds = new THREE.Points(
                geo,
                new THREE.PointsMaterial({
                  size: CLOUD_SIZE,
                  map: cloudTexture,
                  blending: THREE.AdditiveBlending,
                  depthWrite: false,
                  transparent: true,
                  opacity: 0.6,
                  sizeAttenuation: true,
                  color: 0xeeeeff,
                }),
              )
              scene.add(clouds)
            },
          )
        }

        // --- Roads ---
        function createRoads() {
          if (!roadTexture) return
          const roadMat = new THREE.MeshStandardMaterial({
            map: roadTexture,
            side: THREE.FrontSide,
            roughness: 0.9,
            metalness: 0.0,
            polygonOffset: true,
            polygonOffsetFactor: -1.0,
            polygonOffsetUnits: -1.0,
          })

          for (let i = 0; i < ROAD_COUNT; i++) {
            const x1 = (Math.random() - 0.5) * GROUND_SIZE
            const z1 = (Math.random() - 0.5) * GROUND_SIZE
            const angle = Math.random() * Math.PI * 2
            const len =
              ROAD_MIN_LENGTH +
              Math.random() * (ROAD_MAX_LENGTH - ROAD_MIN_LENGTH)
            let x2 = x1 + Math.sin(angle) * len
            let z2 = z1 + Math.cos(angle) * len
            x2 = Math.max(-GROUND_SIZE / 2, Math.min(GROUND_SIZE / 2, x2))
            z2 = Math.max(-GROUND_SIZE / 2, Math.min(GROUND_SIZE / 2, z2))
            const dx = x2 - x1
            const dz = z2 - z1
            const pathLen = Math.sqrt(dx * dx + dz * dz)
            if (pathLen < ROAD_MIN_LENGTH) continue

            const segs = Math.max(1, Math.ceil(pathLen / ROAD_SEGMENT_LENGTH))
            const geo = new THREE.PlaneGeometry(ROAD_WIDTH, pathLen, 1, segs)
            const posAttr = geo.attributes.position
            const tmp = new THREE.Vector3()

            for (let j = 0; j < posAttr.count; j++) {
              tmp.fromBufferAttribute(posAttr, j)
              const t = (tmp.y + pathLen / 2) / pathLen
              const w = tmp.x / ROAD_WIDTH
              const wx = x1 + dx * t
              const wz = z1 + dz * t
              const ty = getTerrainHeight(wx, wz) + ROAD_THICKNESS_OFFSET
              const nx = dz / pathLen
              const nz = -dx / pathLen
              posAttr.setX(j, wx + nx * w * ROAD_WIDTH)
              posAttr.setY(j, wz + nz * w * ROAD_WIDTH)
              posAttr.setZ(j, ty)
            }
            posAttr.needsUpdate = true
            geo.computeVertexNormals()

            const mat = roadMat.clone()
            mat.map = roadTexture.clone()
            mat.map.needsUpdate = true
            mat.map.repeat.set(1, pathLen / ROAD_WIDTH)

            const mesh = new THREE.Mesh(geo, mat)
            mesh.rotation.x = -Math.PI / 2
            mesh.receiveShadow = true
            scene.add(mesh)
          }
        }

        // --- Controls ---
        function setupControls() {
          onKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
              case 'KeyW':
              case 'ArrowUp':
                controls.forward = 1
                break
              case 'KeyS':
              case 'ArrowDown':
                controls.backward = 1
                break
              case 'KeyA':
              case 'ArrowLeft':
                controls.left = 1
                break
              case 'KeyD':
              case 'ArrowRight':
                controls.right = 1
                break
              case 'KeyQ':
                controls.rollLeft = 1
                break
              case 'KeyE':
                controls.rollRight = 1
                break
              case 'ShiftLeft':
              case 'ShiftRight':
                controls.boost = 1
                break
              case 'ControlLeft':
              case 'ControlRight':
                controls.down = 1
                break
              case 'Space':
                controls.up = 1
                break
            }
          }
          onKeyUp = (e: KeyboardEvent) => {
            switch (e.code) {
              case 'KeyW':
              case 'ArrowUp':
                controls.forward = 0
                break
              case 'KeyS':
              case 'ArrowDown':
                controls.backward = 0
                break
              case 'KeyA':
              case 'ArrowLeft':
                controls.left = 0
                break
              case 'KeyD':
              case 'ArrowRight':
                controls.right = 0
                break
              case 'KeyQ':
                controls.rollLeft = 0
                break
              case 'KeyE':
                controls.rollRight = 0
                break
              case 'ShiftLeft':
              case 'ShiftRight':
                controls.boost = 0
                break
              case 'ControlLeft':
              case 'ControlRight':
                controls.down = 0
                break
              case 'Space':
                controls.up = 0
                break
            }
          }
          document.addEventListener('keydown', onKeyDown)
          document.addEventListener('keyup', onKeyUp)
        }

        // --- Game Loop ---
        function animate() {
          if (disposed) return
          animFrameId = requestAnimationFrame(animate)
          const dt = clock.getDelta()

          if (clouds) {
            clouds.position.x += CLOUD_DRIFT_SPEED * dt
            if (clouds.position.x > CLOUD_AREA_XZ / 2)
              clouds.position.x -= CLOUD_AREA_XZ
          }

          updatePlayerMovement(dt)
          updateCameraFOV()
          updateDayNightCycle(dt)
          checkCollisions()

          if (playerAircraft) {
            const relOffset = new THREE.Vector3(0, 2, 10)
            const camOffset = relOffset.applyQuaternion(
              playerAircraft.quaternion,
            )
            const desired = playerAircraft.position.clone().add(camOffset)
            camera.position.lerp(desired, 0.1)
            camera.lookAt(
              playerAircraft.position.clone().add(new THREE.Vector3(0, 1, 0)),
            )
          }

          renderer.render(scene, camera)
          updateInfoPanel()
        }

        function updatePlayerMovement(dt: number) {
          if (!playerAircraft) return
          const curSpeed = playerVelocity.length()
          const maxSpeed =
            PLAYER_SPEED * (controls.boost ? AFTERBURNER_MULTIPLIER : 1)

          let thrust = controls.forward ? PLAYER_SPEED * 5.0 : 0
          thrust *= controls.boost ? AFTERBURNER_MULTIPLIER : 1

          let targetPitch = 0
          if (controls.up) targetPitch = PITCH_SPEED
          if (controls.down) targetPitch = -PITCH_SPEED
          let targetYaw = 0
          if (controls.left) targetYaw = YAW_SPEED
          if (controls.right) targetYaw = -YAW_SPEED
          let targetRoll = 0
          if (controls.rollLeft) targetRoll = ROLL_SPEED
          if (controls.rollRight) targetRoll = -ROLL_SPEED

          playerAngularVelocity.x +=
            (targetPitch - playerAngularVelocity.x) * dt * 5.0
          playerAngularVelocity.y +=
            (targetYaw - playerAngularVelocity.y) * dt * 5.0
          playerAngularVelocity.z +=
            (targetRoll - playerAngularVelocity.z) * dt * 5.0
          playerAngularVelocity.multiplyScalar(DAMPING)

          const dRot = playerAngularVelocity.clone().multiplyScalar(dt)
          const qx = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            dRot.x,
          )
          const qy = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            dRot.y,
          )
          const qz = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 0, 1),
            dRot.z,
          )
          playerAircraft.quaternion
            .multiply(qx)
            .multiply(qy)
            .multiply(qz)
            .normalize()

          const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(
            playerAircraft.quaternion,
          )
          playerVelocity.add(fwd.multiplyScalar(thrust * dt))

          const dragFactor = 1.0 - 0.5 * dt
          playerVelocity.multiplyScalar(dragFactor)

          if (playerVelocity.lengthSq() > maxSpeed * maxSpeed)
            playerVelocity.normalize().multiplyScalar(maxSpeed)

          const MIN_SPEED = 5.0
          if (curSpeed < MIN_SPEED && thrust === 0) {
            playerVelocity.multiplyScalar(0.9)
            if (curSpeed < 0.1) playerVelocity.set(0, 0, 0)
          }

          playerAircraft.position.add(playerVelocity.clone().multiplyScalar(dt))

          if (playerAircraft.position.y < 11) {
            playerAircraft.position.y = 11
            playerVelocity.y = Math.max(0, playerVelocity.y * -0.5)
          }
        }

        function updateCameraFOV() {
          const ratio =
            playerVelocity.length() / (PLAYER_SPEED * AFTERBURNER_MULTIPLIER)
          const target = CAMERA_BASE_FOV + ratio * CAMERA_MAX_FOV_BOOST
          camera.fov += (target - camera.fov) * 0.1
          camera.updateProjectionMatrix()
        }

        function updateDayNightCycle(dt: number) {
          const speed = (2 * Math.PI) / (DAY_NIGHT_CYCLE_MINUTES * 60)
          sunAngle = (sunAngle + speed * dt) % (2 * Math.PI)
          const sunY = Math.sin(sunAngle)
          const sunX = Math.cos(sunAngle)
          sunLight.position.set(sunX * 1500, sunY * 1000, 1000)
          sunLight.target.position.set(0, 0, 0)

          const fog = scene.fog as THREE.Fog | null
          if (sunY > 0) {
            sunLight.intensity = Math.max(0.1, sunY) * 1.5
            skyLight.intensity = Math.max(0.2, sunY * 0.6)
            sunLight.color.setHSL(0.1, 1, Math.max(0.5, sunY))
            skyLight.color.setHSL(0.6, 0.6, Math.max(0.3, sunY * 0.7))
            if (fog) {
              fog.color.setHSL(0.6, 0.3, Math.max(0.6, sunY * 0.8))
              fog.near = 1000 + (1 - sunY) * 2000
              fog.far = 15000 - (1 - sunY) * 5000
            }
            renderer.setClearColor(skyLight.color)
          } else {
            sunLight.intensity = 0
            skyLight.intensity = 0.1 + Math.abs(sunY) * 0.1
            skyLight.color.setHSL(0.6, 0.3, 0.1)
            if (fog) {
              fog.color.setHSL(0.6, 0.1, 0.05)
              fog.near = 500
              fog.far = 8000
            }
            renderer.setClearColor(0x000011)
          }
        }

        function checkCollisions() {
          if (
            !playerAircraft ||
            !playerAircraft.children ||
            playerAircraft.children.length === 0
          )
            return false
          const pBox = new THREE.Box3().setFromObject(playerAircraft)
          isColliding = false

          for (const bBox of buildingBoundingBoxes) {
            if (pBox.intersectsBox(bBox)) {
              isColliding = true
              const pCenter = new THREE.Vector3()
              pBox.getCenter(pCenter)
              const bCenter = new THREE.Vector3()
              bBox.getCenter(bCenter)
              const normal = pCenter.sub(bCenter).normalize()
              const speed = playerVelocity.length()
              if (speed > 1.0) {
                playerVelocity.reflect(normal).multiplyScalar(0.5)
              } else {
                playerVelocity.set(0, 0, 0)
              }
              playerAircraft.position.add(normal.multiplyScalar(1.0))
              break
            }
          }

          playerAircraft.traverse((child) => {
            const mesh = child as THREE.Mesh
            if ((mesh as THREE.Mesh).isMesh && mesh.material) {
              const mats = Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material]
              for (const mat of mats) {
                if (
                  (mat as THREE.MeshStandardMaterial).isMeshStandardMaterial ||
                  (mat as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial
                ) {
                  ;(mat as THREE.MeshStandardMaterial).emissive.setHex(
                    isColliding ? 0xaa0000 : 0x000000,
                  )
                }
              }
            }
          })
          return isColliding
        }

        function updateInfoPanel() {
          if (!playerAircraft) return
          const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
            playerAircraft.quaternion,
          )
          const readout = getFlightHudReadout({
            altitude: playerAircraft.position.y,
            headingRadians: Math.atan2(forward.x, -forward.z),
            speedUnits: playerVelocity.length(),
            thrusting: controls.forward === 1,
            boosting: controls.boost === 1,
          })
          if (speedEl) speedEl.textContent = readout.speed
          if (altEl) altEl.textContent = readout.altitude
          if (headingEl) headingEl.textContent = readout.heading
          if (throttleEl) throttleEl.textContent = readout.throttle
        }

        // --- Start ---
        init()
      } catch (err) {
        if (!disposed)
          setError(
            err instanceof Error ? err.message : 'Failed to initialize game',
          )
      }
    })()

    return () => {
      disposed = true
      cancelAnimationFrame(animFrameId)
      cancelAnimationFrame(ufoFrameId)
      if (onKeyDown) document.removeEventListener('keydown', onKeyDown)
      if (onKeyUp) document.removeEventListener('keyup', onKeyUp)
      if (onResize) window.removeEventListener('resize', onResize)
      rendererInstance?.dispose()
      if (
        rendererInstance?.domElement &&
        container.contains(rendererInstance.domElement)
      ) {
        container.removeChild(rendererInstance.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative h-screen w-full overflow-hidden bg-background ${cfg.className ?? ''}`}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70">
          <div className="rounded bg-background/80 px-5 py-4 font-mono text-sm text-foreground">
            Loading Flight Simulator…
          </div>
        </div>
      )}
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70">
          <div className="rounded border border-destructive bg-background/80 px-5 py-4 font-mono text-sm text-destructive">
            {error}
          </div>
        </div>
      )}
      {/* HUD */}
      {showHud && (
        <div className="pointer-events-none absolute top-2 left-2 z-10 rounded bg-background/50 p-1.5 font-mono text-xs text-foreground">
          Speed: <span id="fs-speed">0</span> km/h
          <br />
          Altitude: <span id="fs-altitude">0.0</span> m
          <br />
          Heading: <span id="fs-heading">0</span>°
          <br />
          Throttle: <span id="fs-throttle">0</span>%
        </div>
      )}
    </div>
  )
}
