import * as THREE from 'three';
import './background.css'
import React from 'react';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


export default class BackgroundAnimationTiles extends React.Component {
    componentDidMount() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, document.body.clientWidth / document.body.clientHeight, 1, 500);

        const canvas = document.getElementById('background-canvas');

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(document.body.clientWidth, document.body.clientHeight);
        window.addEventListener('resize', () => {
            camera.aspect = document.body.clientWidth / document.body.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(document.body.clientWidth, document.body.clientHeight, true);
        });
        camera.position.set(0, 100, 0);
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
        renderer.shadowMap.enabled = true;

        const rectangles = [];

        function generateRectangles() {
            const scaleX = 10;
            const scaleY = 10;
            for (let x = 0; x < 20; x++) {
                for (let y = 0; y < 10; y++) {
                    const geometry = new THREE.BoxGeometry(scaleX, 25, scaleY, 1, 1, 1);
                    const material = new THREE.MeshStandardMaterial({ color: 0x111 });
                    const rectangle = new THREE.Mesh(geometry, material);
                    rectangle.position.set(-97 + (scaleX * x), -20, -45 + (scaleY * y));

                    scene.add(rectangle);
                    rectangles.push(rectangle);
                }
            }
        }


        const cameraControls = new OrbitControls(camera, renderer.domElement);


        // const controls = new DragControls(rectangles, camera, renderer.domElement);
        // controls.addEventListener('dragstart', function (event) {
        //     event.object.material.emissive.set(0xaaaaaa);
        // });
        // controls.addEventListener('dragend', function (event) {
        //     event.object.material.emissive.set(0x000000);
        // });

        generateRectangles();
        const pointer = new THREE.Vector2();
        function onPointerMove(event) {
            pointer.x = (event.clientX / document.body.clientWidth) * 2 - 1;
            pointer.y = - (event.clientY / document.body.clientHeight) * 2 + 1;
            pointer.x *= 100;
            pointer.y *= 45;
        }

        window.addEventListener('pointermove', onPointerMove);
        const light = new THREE.PointLight(0xffffff, 10, 0, 0);
        light.position.set(-10, 25, 10);
        scene.add(light);

        function animate(params) {
            requestAnimationFrame(animate);
            const time = Date.now() * 0.001;
            const radius = 35;
            light.position.z = Math.sin(time) * radius;
            light.position.x = Math.cos(time) * radius;
            for (let index = 0; index < rectangles.length; index++) {
                const element = rectangles[index];
                const distance = Math.sqrt(Math.pow(element.position.x - pointer.x, 2) + Math.pow(element.position.z + pointer.y, 2));
                element.position.y = 10 - (distance / 5);
            }
            renderer.render(scene, camera);
        }
        animate();
        document.body.appendChild(renderer.domElement);
    }

    render() {
        return (
            <canvas id="background-canvas"></canvas>
        );
    }
}