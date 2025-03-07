import * as THREE from 'three';
import './background.css'
import React from 'react';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


export default class BackgroundAnimationTiles extends React.Component {

    constructor(props) {
        super(props);
        this.camera = null;
        this.scene = null;
        this.renderer = null;
    }

    componentWillUnmount() {
        this.camera = null;
        this.scene = null;
        this.renderer = null;
    }

    componentDidMount() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, document.body.clientWidth / document.body.clientHeight, 1, 500);

        const canvas = document.getElementById('background-canvas');

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(document.body.clientWidth, document.body.clientHeight);
        window.addEventListener('resize', () => {
            this.camera.aspect = document.body.clientWidth / document.body.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(document.body.clientWidth, document.body.clientHeight, true);
        });
        this.camera.position.set(0, 100, 0);
        this.camera.lookAt(this.scene.position);
        this.renderer.render(this.scene, this.camera);
        this.renderer.shadowMap.enabled = true;

        const rectangles = [];

        const generateRectangles = () => {
            const scaleX = 10;
            const scaleY = 10;
            for (let x = 0; x < 20; x++) {
                for (let y = 0; y < 10; y++) {
                    const geometry = new THREE.BoxGeometry(scaleX, 25, scaleY, 1, 1, 1);
                    const material = new THREE.MeshStandardMaterial({ color: 0x111 });
                    const rectangle = new THREE.Mesh(geometry, material);
                    rectangle.position.set(-97 + (scaleX * x), -20, -45 + (scaleY * y));

                    this.scene.add(rectangle);
                    rectangles.push(rectangle);
                }
            }
        }


        // const cameraControls = 
        new OrbitControls(this.camera, this.renderer.domElement);


        // const controls = new DragControls(rectangles, this.camera, renderer.domElement);
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
        this.scene.add(light);

        const animate = (params) => {
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
            this.renderer.render(this.scene, this.camera);
        }
        animate();
        document.body.appendChild(this.renderer.domElement);
    }

    render() {
        return (
            <canvas id="background-canvas"></canvas>
        );
    }
}