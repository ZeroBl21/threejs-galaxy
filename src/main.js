import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

import galaxyVertexShader from './shaders/test/vertex.glsl'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('#canvas')

// Scene
const scene = new THREE.Scene()

const textureLoader = new THREE.TextureLoader()
const star = textureLoader.load('/particles/8.png')

/**
 * Galaxy
 */

const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: 0xff6030,
  outsideColor: 0x1b3984,
}

// const getRandomValue = (power) => {
// 	return Math.pow(Math.random(), power) * (Math.random() < 0.5 ? 1 : -1)
// }

// Base

let geometry = null
let material = null
let points = null

const generateGalaxy = () => {
  if (points !== null) {
    geometry.dispose()
    material.dispose()
    scene.remove(points)
  }

  /**
   * Geometry
   */
  geometry = new THREE.BufferGeometry()

  const positions = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3)

  const colorInside = new THREE.Color(parameters.insideColor)
  const colorOutside = new THREE.Color(parameters.outsideColor)

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3

    // Positions
    const radius = Math.random() * parameters.radius

    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius

    positions[i3] = Math.cos(branchAngle) * radius + randomX
    positions[i3 + 1] = randomY
    positions[i3 + 2] = Math.sin(branchAngle) * radius + randomZ

    // Color
    const mixedColor = colorInside.clone()
    mixedColor.lerp(colorOutside, radius / parameters.radius)

    colors[i3] = mixedColor.r
    colors[i3 + 1] = mixedColor.g
    colors[i3 + 2] = mixedColor.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  /**
   * Material
   */
  material = new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    vertexShader: galaxyVertexShader,
  })

  /**
   * Points
   */
  points = new THREE.Points(geometry, material)
  scene.add(points)
}

generateGalaxy()

gui.add(parameters, 'count', 100, 1000000, 100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size', 0.001, 0.1, 0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius', 0.01, 20, 0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches', 2, 20, 1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin', -5, 5, 0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness', 0, 2, 0.01).onFinishChange(generateGalaxy)
gui
  .add(parameters, 'randomnessPower', 1, 10, 0.01)
  .onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
