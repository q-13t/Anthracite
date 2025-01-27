import React from "react";
import './3DViewer.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DragControls } from "three/examples/jsm/Addons.js";
import InputManager from "./InputManager.jsx";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import DownArrow from "../../assets/DownArrow.svg";
import UpArrow from '../../assets/UpArrow.svg';

export default class ThreeDViewer extends React.Component {
    constructor(props) {
        super(props);
        this.available_height = 0;
        this.available_width = 0;
        this.willUnmount = false;
        this.resizeObserver = null;

        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.selectedObject = null;
        this.state = {
        };
    }



    componentWillUnmount() {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
        this.willUnmount = true;
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.selectedObject = null;
    }

    componentDidMount() {
        let canvas = document.querySelector(`canvas[canvas-id="${this.props.id}"]`);
        this.available_height = canvas.offsetWidth * 0.75;
        this.available_width = canvas.offsetHeight;

        const scene = new THREE.Scene();
        this.scene = scene;
        this.scene.background = new THREE.Color(0x232323);
        this.scene.matrixAutoUpdate = true;
        this.scene.matrixWorldAutoUpdate = true;
        this.scene.matrixWorldNeedsUpdate = true;

        let camera = new THREE.PerspectiveCamera(90, this.available_width / this.available_height, 1, 500);
        this.camera = camera;
        const renderer = new THREE.WebGLRenderer({ canvas: canvas });
        this.renderer = renderer;

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.available_width, this.available_height);
        this.scene.position.set(0, 0, 0);
        this.camera.position.set(0, 50, 0);
        this.camera.lookAt(this.scene.position);
        this.renderer.render(this.scene, this.camera);
        this.renderer.shadowMap.enabled = true;

        this.resizeObserver = new ResizeObserver((element) => {
            let canvas = document.querySelector(`canvas[canvas-id="${this.props.id}"]`);
            // console.log(element[0].contentRect.width);
            this.available_width = element[0].contentRect.width * 0.75;
            this.available_height = element[0].contentRect.height;
            canvas.width = this.available_width;
            canvas.height = this.available_height;
            this.camera.aspect = this.available_width / this.available_height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.available_width, this.available_height);
            this.forceUpdate();
        });
        this.resizeObserver.observe(document.querySelector(`div[three-d-viewer="${this.props.id}"]`));

        const CameraControls = new OrbitControls(this.camera, this.renderer.domElement);
        CameraControls.addEventListener('change', () => {
            this.forceUpdate();
        });
        const HelperGrid = new THREE.GridHelper(100, 10);
        this.scene.add(HelperGrid);



        new MTLLoader().load('/Skull/12140_Skull_v3_L2.mtl', (material) => {
            var ObjectLoader = new OBJLoader();
            ObjectLoader.setMaterials(material);
            ObjectLoader.load('/Skull/12140_Skull_v3_L2.obj', (object) => {
                object.position.set(0, 0, 10);
                object.scale.set(1, 1, 1);
                object.rotation.set(-3, 0, 0);
                object.name = 'Skull';
                this.scene.add(object);
            });
        });

        const raycaster = new THREE.Raycaster();

        const onCanvasClick = (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX - rect.left) / canvas.width * 2 - 1;
            mouse.y = -(event.clientY - rect.top) / canvas.height * 2 + 1;
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.scene.children);
            if (intersects.length > 0 && intersects[0].object.type === 'Mesh') {
                this.selectedObject = intersects[0].object;
                const dragControls = new DragControls([this.selectedObject], this.camera, renderer.domElement);
                dragControls.addEventListener('dragstart', (event) => {
                    CameraControls.enabled = false;
                    this.selectObject(event.object);
                });
                dragControls.addEventListener('drag', (event) => {
                    this.forceUpdate();
                });
                dragControls.addEventListener('dragend', (event) => {
                    CameraControls.enabled = true;
                    dragControls.dispose();
                });
            }
            this.forceUpdate();
        }

        canvas.addEventListener('mousedown', onCanvasClick);

        const AmbientLight = new THREE.AmbientLight(0x404040, 100)
        AmbientLight.name = "AmbientLight";
        AmbientLight.isLight = false;
        this.scene.add(AmbientLight);

        const DirectionalLight = new THREE.DirectionalLight(0xffffff, 5);
        DirectionalLight.name = "DirectionalLight";
        DirectionalLight.position.set(0, 20, 0);
        DirectionalLight.isLight = true;
        this.scene.add(DirectionalLight);

        const DirectionalLightHelper = new THREE.DirectionalLightHelper(DirectionalLight, 10);
        this.scene.add(DirectionalLightHelper);

        const animate = () => {
            if (this.willUnmount) { return; }
            requestAnimationFrame(animate);

            this.camera.updateProjectionMatrix();
            this.camera.updateMatrixWorld();
            CameraControls.update();
            this.renderer.render(this.scene, this.camera);
        }
        animate();
        this.camera = camera;
        this.forceUpdate();
    }

    collapseItem(id) {
        let element = document.querySelector(`[control-id="${id}"]`);
        let caller = document.querySelector(`[caller-id="${id}"]`);
        if (element && caller) {
            element.classList.toggle('collapsed');
            caller.src = element.classList.contains('collapsed') ? DownArrow : UpArrow;
        }
    }

    expandObjectSelector() {
        let element = document.querySelector(`.Object-Selector-Container`);
        let expander = document.querySelector(`.Object-Selector-Expander`);

        if (element && expander) {
            element.classList.toggle('Selector-Collapsed');
            expander.src = element.classList.contains('Selector-Collapsed') ? DownArrow : UpArrow;
        }
    }

    selectObject(object) {
        this.selectedObject = object;
        this.forceUpdate();
    }

    render() {
        return (
            <div three-d-viewer={this.props.id} className="ThreeDViewer">
                <canvas canvas-id={this.props.id} className="Viewer-Canvas"></canvas>
                <div className="Object-Selector">
                    <img src={DownArrow} className="Object-Selector-Expander" alt="" onClick={() => { this.expandObjectSelector() }} />
                    <div className="Object-Selector-Container Selector-Collapsed" >
                        {
                            this.scene && this.scene.children &&
                            this.scene.children.map((object, index) => {
                                return (
                                    <InputManager key={index} object={object} k={null} collapseItem={this.collapseItem.bind(this)} selectObject={this.selectObject.bind(this)} selectedObject={this.selectedObject} />
                                )
                            })
                        }
                    </div>
                </div>
                <div className="Viewer-Controls">
                    <div className="Scene-controls">
                        <div className="Control-Header" onClick={() => { this.collapseItem("Camera") }}>
                            <p>Camera</p>
                            <img caller-id={"Camera"} src={DownArrow} alt="Collapse/Expand" />
                        </div>
                        <div control-id={"Camera"} className="Control-Container collapsed">
                            {this.camera &&
                                Object.keys(this.camera).map((key) => {

                                    return (<InputManager object={this.camera} k={key} collapseItem={this.collapseItem.bind(this)} />);

                                })
                            }
                        </div>
                    </div>
                    <div className="Scene-controls">
                        <div className="Control-Header" onClick={() => { this.collapseItem("Scene") }}>
                            <p>Scene</p>
                            <img caller-id={"Scene"} src={DownArrow} alt="Collapse/Expand" />
                        </div>
                        <div control-id={"Scene"} className="Control-Container collapsed">
                            {this.scene &&
                                Object.keys(this.scene).map((key, index) => {
                                    if (key && this.scene) {
                                        return (<InputManager key={key} object={this.scene} k={key} collapseItem={this.collapseItem.bind(this)} />);
                                    }
                                })
                            }
                        </div>
                    </div>
                    <div className="Scene-controls">
                        <div className="Control-Header" onClick={() => { this.collapseItem("Object") }}>
                            <p>Object</p>
                            <img caller-id={"Object"} src={DownArrow} alt="Collapse/Expand" />
                        </div>
                        <div control-id={"Object"} className="Control-Container collapsed">
                            {this.selectedObject &&
                                Object.keys(this.selectedObject).map((key, index) => {
                                    if (key && this.selectedObject) {
                                        return (<InputManager key={key} object={this.selectedObject} k={key} collapseItem={this.collapseItem.bind(this)} />);
                                    }
                                })
                            }
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}