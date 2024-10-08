/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, Suspense } from 'react';
import {useThree } from "@react-three/fiber";

import * as THREE from "three";
import { useGLTF, useAnimations, useTexture, Text } from "@react-three/drei"

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { PMREMGenerator } from "three/src/extras/PMREMGenerator";
import { useControls } from "leva";
import { TextureLoader } from "three/src/loaders/TextureLoader";

import useStore from "@/helpers/store";

const options = {
  color: "#37baf2",
  enableSwoopingCamera: false,
  enableRotation: false,
  metalness: 1.00,
  roughness: 0.2,
  transmission: 0.00,
  ior: 1.00,
  reflectivity: 0.73,
  thickness: 1.00,
  envMapIntensity: 1.98,
  clearcoat: 0.83,
  clearcoatRoughness: 0.16,
  normalScale: 3.05,
  clearcoatNormalScale: 0.2,
  normalRepeat: 1.00,
  // attenuationTint: 0xffffff,
  // attenuationDistance: 0,
  bloomThreshold: 0.85,
  bloomStrength: 0.35,
  bloomRadius: 0.33,
};

const record = (canvas, time) => {
  var recordedChunks = [];
  return new Promise(function (res, rej) {
      var stream = canvas.captureStream(30 /*fps*/);

      var mediaRecorder = new MediaRecorder(stream);

      //ondataavailable will fire in interval of `time || 4000 ms`

      mediaRecorder.ondataavailable = function (event) {
          recordedChunks.push(event.data);
      };

      mediaRecorder.onstop = function (event) {
          var blob = new Blob(recordedChunks, { type: "video/mp4" });
          var url = URL.createObjectURL(blob);
          res(url);
      };

      mediaRecorder.start();
      setTimeout(function () { mediaRecorder.stop(); }, time);
  });
}



const Lights = () => {
  return (
      <group>
          <ambientLight intensity={0.2} />
          <spotLight
              position={[0, 200, -220]}
              castShadow={false}
              intensity={0.05}
              penumbra={0.5}
          />
          <spotLight
              position={[0, 200, 130]}
              castShadow={true}
              intensity={0.05}
              penumbra={0.5}
          />
      </group>
  );
};


const FrameModel = (props) => {

const frameMat = useRef<THREE.MeshPhysicalMaterial>(null);
// Fetch model and a separate texture

const {setVideoURL, canvasRef} = useStore();

const { 
    nodes,
    animations 
} = useGLTF("models/Glas_Frame_v07_262frames_30fps_with1secStartEnd_withCam.gltf")

console.log(nodes, "test")

const colorMap = useTexture("textures/test.jpg")

// Extract animation actions
const { ref, actions, names } = useAnimations(animations)

const opts = useControls({
  color: {
      value: options.color,
  },
  roughness: {
      min: 0,
      max: 1,
      value: options.roughness
  },
  metalness: {
      min: 0,
      max: 1,
      value: options.metalness
  },
  transmission: {
      min: 0,
      max: 1,
      value: options.transmission
  },
  ior: {
      min: 1,
      max: 2.33,
      value: options.ior
  },
  reflectivity: {
      min: 0,
      max: 1,
      value: options.reflectivity
  },
  thickness: {
      min: 0,
      max: 5,
      value: options.thickness
  },
  envMapIntensity: {
      min: 0,
      max: 3,
      value: options.envMapIntensity
  },
  clearcoat: {
      min: 0,
      max: 1,
      value: options.clearcoat
  },
  clearcoatRoughness: {
      min: 0,
      max: 1,
      value: options.clearcoatRoughness
  },
  normalScale: {
      min: 0,
      max: 5,
      value: options.normalScale
  },
  clearcoatNormalScale: {
      min: 0,
      max: 5,
      value: options.clearcoatNormalScale
  },
  normalRepeat: {
      min: 1,
      max: 4,
      value: options.normalRepeat
  },
});


// useEffect(() => {
//     if(frameMat.current){
//         const action = actions[names[0]];
//         action.setLoop(THREE.LoopPingPong, Infinity);
//         // action.reset().fadeIn(0.5).setEffectiveTimeScale(0.85).play(); // control the time scale of the animation
//         action.reset().fadeIn(0.2).play();
//         action.play();
    
//         setTimeout(() => {
//           record(canvasRef, (262000 / 30 -1000)).then((url) => {
//               setVideoURL(url);
//           });
//       }, 1000);
     
//     }
// }, [actions, names, frameMat])

const { gl, scene } = useThree();

const pmremGenerator = new PMREMGenerator(gl);
const loader = new RGBELoader();

useEffect(() => {
    loader.load(
        'textures/empty_warehouse_01_2k.hdr',
        function (texture) {
            const textureData = pmremGenerator.fromEquirectangular(texture).texture;
            scene.environment = textureData;
            frameMat.current.envMap = textureData;
            texture.dispose();
            pmremGenerator.dispose();

            const action = actions[names[0]];
            action.setLoop(THREE.LoopPingPong, Infinity);
            // action.reset().fadeIn(0.5).setEffectiveTimeScale(0.85).play(); // control the time scale of the animation
            // action.reset().fadeIn(0.2).play();
            action.play();
        
            setTimeout(() => {
              record(canvasRef, (262000 / 30 -500)).then((url) => {
                  setVideoURL(url);
              });
          }, 500);
          
        }
    )

}, [loader, pmremGenerator, scene,actions]);

return (
    <group ref={ref} {...props} dispose={null}>
    <group
        // position={[-0.016, 0, 0]}
        // rotation={[-0.284, 0.243, 0.12]}
    >
        <mesh
            name="Shape_03"
            castShadow
            receiveShadow
            geometry={nodes.Shape_03.geometry}
            material={nodes.Shape_03.material}
            position={[-0.025, -0.771, -0.212]}
            rotation={[-2.906, 0.27, 0.053]}
            scale={[0.001, -0.001, 0.001]}
        />
        <mesh
            name="Shape_02"
            castShadow
            receiveShadow
            geometry={nodes.Shape_02.geometry}
            material={nodes.Shape_02.material}
            position={[-0.129, -0.76, -0.239]}
            rotation={[-2.906, 0.27, 0.053]}
            scale={[0.001, -0.001, 0.001]}
        />
        <mesh
            name="Shape_01"
            castShadow
            receiveShadow
            geometry={nodes.Shape_01.geometry}
            material={nodes.Shape_01.material}
            position={[-0.095, -0.764, -0.23]}
            rotation={[-2.906, 0.27, 0.053]}
            scale={[0.001, -0.001, 0.001]}
        />
        <mesh
            name="Shape_0"
            castShadow
            receiveShadow
            geometry={nodes.Shape_0.geometry}
            material={nodes.Shape_0.material}
            position={[0.046, -0.781, -0.194]}
            rotation={[-2.906, 0.27, 0.053]}
            scale={[0.001, -0.001, 0.001]}
        />
        <mesh
            name="image"
            castShadow
            receiveShadow
            geometry={nodes.image.geometry}
            material={nodes.image.material}
            position={[0.029, -0.016, 0.015]}
            rotation={[0.262, -0.266, 3.092]}
        >
            <meshStandardMaterial
                map={colorMap}
                side={THREE.DoubleSide}
                // color={opts.color}
                // metalness={opts.metalness}
                // roughness={opts.roughness}
                // transmission={opts.transmission}
                // ior={opts.ior}
                // reflectivity={opts.reflectivity}
                // thickness={opts.thickness}
                // clearcoat={opts.clearcoat}
                // clearcoatRoughness={opts.clearcoatRoughness}
                // // normalMap={texture}
                // // normalMap={normalMapTexture}
                // // clearcoatNormalMap={normalMapTexture}
                // normalScale={new THREE.Vector2(opts.normalScale)}
                // clearcoatNormalScale={new THREE.Vector2(opts.clearcoatNormalScale)}
            />
        </mesh>
        <group position={[0.982, -0.851, 0.064]} rotation={[0.266, -0.192, -0.049]} scale={0.01}>
            {/* <mesh
            castShadow
            receiveShadow
            geometry={nodes["Shimmer_Logo_Wyn-01"].children[0].geometry}
            material={nodes["Shimmer_Logo_Wyn-01"].children[0].material}
            position={[3.353, -3.001, 5.405]}
            rotation={[0, -0.066, 0]}
        >
            <meshPhysicalMaterial
                ref={frameMat}
                color={options.color}
                metalness={opts.metalness}
                roughness={opts.roughness}
                transmission={opts.transmission}
                ior={opts.ior}
                reflectivity={opts.reflectivity}
                thickness={opts.thickness}
                clearcoat={opts.clearcoat}
                clearcoatRoughness={opts.clearcoatRoughness}
                // normalMap={texture}
                // normalMap={normalMapTexture}
                // clearcoatNormalMap={normalMapTexture}
                normalScale={new THREE.Vector2(opts.normalScale)}
                clearcoatNormalScale={new THREE.Vector2(opts.clearcoatNormalScale)}
            />
        </mesh> */}
            {/* <mesh
            castShadow
            receiveShadow
            geometry={nodes.Shape_1.geometry}
            material={nodes.Shape_1.material}
            position={[1.349, -5.182, 5.273]}
            rotation={[0, -0.066, 0]}
        >
            <meshPhysicalMaterial
                ref={frameMat}
                color={opts.color}
                metalness={opts.metalness}
                roughness={opts.roughness}
                transmission={opts.transmission}
                ior={opts.ior}
                reflectivity={opts.reflectivity}
                thickness={opts.thickness}
                clearcoat={opts.clearcoat}
                clearcoatRoughness={opts.clearcoatRoughness}
                // normalMap={texture}
                // normalMap={normalMapTexture}
                // clearcoatNormalMap={normalMapTexture}
                normalScale={new THREE.Vector2(opts.normalScale)}
                clearcoatNormalScale={new THREE.Vector2(opts.clearcoatNormalScale)}
            />
        </mesh> */}
        </group>

        <mesh
            name="Cube_21"
            castShadow
            receiveShadow
            geometry={nodes.Cube_21.geometry}
            material={nodes.Cube_21.material}
            position={[-0.056, 0.015, -0.074]}
            rotation={[0.263, -0.249, -0.05]}
            scale={[0.0077, 0.0077, 0.0087]}
        >
            <meshPhysicalMaterial
                ref={frameMat}
                color={opts.color}
                metalness={opts.metalness}
                roughness={opts.roughness}
                transmission={opts.transmission}
                ior={opts.ior}
                reflectivity={opts.reflectivity}
                thickness={opts.thickness}
                clearcoat={opts.clearcoat}
                clearcoatRoughness={opts.clearcoatRoughness}
                // normalMap={texture}
                // normalMap={normalMapTexture}
                // clearcoatNormalMap={normalMapTexture}
                normalScale={new THREE.Vector2(opts.normalScale)}
                clearcoatNormalScale={new THREE.Vector2(opts.clearcoatNormalScale)}
            />
        </mesh>
        <mesh
            name="Cube_2"
            castShadow
            receiveShadow
            geometry={nodes.Cube_2.geometry}
            material={nodes.Cube_2.material}
            position={[-0.119, 0.013, -0.047]}
            rotation={[0.263, -0.249, -0.05]}
            scale={[0.01, 0.01, 0.011]}
        >
            <meshPhysicalMaterial
                ref={frameMat}
                color={opts.color}
                metalness={opts.metalness}
                roughness={opts.roughness}
                transmission={opts.transmission}
                ior={opts.ior}
                reflectivity={opts.reflectivity}
                thickness={opts.thickness}
                clearcoat={opts.clearcoat}
                clearcoatRoughness={opts.clearcoatRoughness}
                // normalMap={texture}
                // normalMap={normalMapTexture}
                // clearcoatNormalMap={normalMapTexture}
                normalScale={new THREE.Vector2(opts.normalScale)}
                clearcoatNormalScale={new THREE.Vector2(opts.clearcoatNormalScale)}
            />
        </mesh>
        <directionalLight
            color={"#FFB6C1"}
            intensity={0.22}
            decay={2}
            rotation={[-0.506, 0.629, 0.756]}
        />
        <directionalLight
            color={"#FFB6C1"}
            intensity={0.22}
            decay={2}
        />
        <pointLight
            color={"#FFB6C1"}
            intensity={0.22}
            position={[200, 200, 200]}
        />
    </group>
</group>
)
}



const Frame = (props) => {

return (
    <>
        <color attach="background" args={["#000000"]} />
        <Lights />
        <group dispose={null}  >

            <Suspense fallback={null}>
                <FrameModel
                />
            <Text
                maxWidth={10}
                anchorX="center"
                anchorY="middle"
                position={[0, -1, 1]}
                rotation={[0, 0, 0]}
                fontSize={0.25}
                color="white"
            >
               {" Owner : Ryo Mukaitsubo"}
            </Text>
            </Suspense>
        </group>
    </>
)
};
export default Frame;
