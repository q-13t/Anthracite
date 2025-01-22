import React from "react";
import './3DViewer.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DragControls } from "three/examples/jsm/Addons.js";
import CubeProperties from "./ObjectStateManager/ObjectProperties_Cube.ts";
import InputManager from "./InputManager.jsx";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

export default class ThreeDViewer extends React.Component {
    constructor(props) {
        super(props);
        this.available_height = 0;
        this.available_width = 0;
        this.resizeObserver = null;
        this.cameraPos = 0;
        this.state = {
        };
        this.elements = [
            { properties: new CubeProperties({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { width: 10, height: 10, depth: 10 }, { r: 255, g: 0, b: 1 }), id: 0, element: null },
        ];
    }

    componentWillUnmount() {
        this.resizeObserver.disconnect();
    }

    componentDidMount() {
        let canvas = document.querySelector(`canvas[canvas-id="${this.props.id}"]`);
        this.available_height = canvas.offsetWidth * 0.75;
        this.available_width = canvas.offsetHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xAAAAAA);
        const camera = new THREE.PerspectiveCamera(90, this.available_width / this.available_height, 1, 500);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(this.available_width, this.available_height);
        scene.position.set(0, 0, 0);
        camera.position.set(0, 50, 0);
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
        renderer.shadowMap.enabled = true;

        this.resizeObserver = new ResizeObserver((element) => {
            let canvas = document.querySelector(`canvas[canvas-id="${this.props.id}"]`);
            console.log(element[0].contentRect.width);
            this.available_width = element[0].contentRect.width * 0.75;
            this.available_height = element[0].contentRect.height;
            canvas.width = this.available_width;
            canvas.height = this.available_height;
            camera.aspect = this.available_width / this.available_height;
            camera.updateProjectionMatrix();
            renderer.setSize(this.available_width, this.available_height);
        });
        this.resizeObserver.observe(document.querySelector(`div[three-d-viewer="${this.props.id}"]`));

        const CameraControls = new OrbitControls(camera, renderer.domElement);

        const HelperGrid = new THREE.GridHelper(100, 10);
        scene.add(HelperGrid);


        new MTLLoader().load('/Skull/12140_Skull_v3_L2.mtl', function name(material) {
            var ObjectLoader = new OBJLoader();
            ObjectLoader.setMaterials(material);
            ObjectLoader.load('/Skull/12140_Skull_v3_L2.obj', function (object) {
                object.position.set(0, 0, 10);
                object.scale.set(1, 1, 1);
                object.rotation.set(-3, 0, 0);
                scene.add(object);
            });
        });

        function setSelectedObject(id) {
            console.log(id);
            this.elements.forEach((element) => {
                if (element.id === id) {

                    console.log(element);

                }
            })
        }
        setSelectedObject.bind(this);


        const raycaster = new THREE.Raycaster();

        function onDocumentMouseDown(event) {
            event.preventDefault();
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children);
            if (intersects.length > 0 && intersects[0].object.type === 'Mesh') {
                const selectedObject = intersects[0].object;
                const dragControls = new DragControls([selectedObject], camera, renderer.domElement);
                dragControls.addEventListener('dragstart', function (event) {
                    CameraControls.enabled = false;
                });
                dragControls.addEventListener('drag', function (event) {
                });
                dragControls.addEventListener('dragend', function (event) {
                    CameraControls.enabled = true;
                });
            }
        }

        canvas.addEventListener('mousedown', onDocumentMouseDown);

        const light = new THREE.AmbientLight(0x404040, 100)
        scene.add(light);
        function animate(params) {
            requestAnimationFrame(animate);
            // const time = Date.now() * 0.001;
            renderer.render(scene, camera);
        }
        animate.bind(this);
        animate();
    }

    changeSlider(e) {
        console.log(e.target.value);
        this.setState({ cameraPos: e.target.value });
    }

    render() {
        return (
            <div three-d-viewer={this.props.id} className="ThreeDViewer">
                <canvas canvas-id={this.props.id} className="Viewer-Canvas"></canvas>
                <div className="Viewer-Controls">
                    <div className="Viewer-Controls">
                        <InputManager />
                    </div>
                </div>
            </div>
        );
    }
}