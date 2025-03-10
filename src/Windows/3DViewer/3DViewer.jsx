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
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { saveAs } from "file-saver";
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

export default class ThreeDViewer extends React.Component {
    constructor(props) {
        super(props);
        this.available_height = 0;
        this.available_width = 0;
        this.willUnmount = false;
        this.resizeObserver = null;

        this.textureZoom = 1;
        this.drawingData = { prevX: 0, prevY: 0, currX: 0, currY: 0, color: null, size: 5, flag: false, dot_flag: false };

        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.selectedObject = null;
        this.textureCanvas = null;
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
        this.textureCanvas.removeEventListener('wheel', this.ZoomInCanvas.bind(this));
        this.textureCanvas.removeEventListener("mousemove", this.findXY.bind(this, "Move"));
        this.textureCanvas.removeEventListener("mouseup", this.findXY.bind(this, "Up"));
        this.textureCanvas.removeEventListener("mousedown", this.findXY.bind(this, "Down"));
        this.textureCanvas.removeEventListener("mouseout", this.findXY.bind(this, "Out"));
        this.textureCanvas = null;
    }

    componentDidMount() {
        this.textureCanvas = document.querySelector(`canvas[canvas-id="${this.props.id + "Texture"}"]`);
        this.textureCanvas.addEventListener('wheel', this.ZoomInCanvas.bind(this));
        this.textureCanvas.addEventListener("mousemove", this.findXY.bind(this, "Move"));
        this.textureCanvas.addEventListener("mouseup", this.findXY.bind(this, "Up"));
        this.textureCanvas.addEventListener("mousedown", this.findXY.bind(this, "Down"));
        this.textureCanvas.addEventListener("mouseout", this.findXY.bind(this, "Out"));

        const canv_context = this.textureCanvas.getContext('2d');
        canv_context.fillStyle = 'white';
        canv_context.fillRect(0, 0, this.textureCanvas.width, this.textureCanvas.height);
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

    expandObjectSelector(id) {
        let element = document.querySelector(`[control-id="${id}"]`);;
        let expander = document.querySelector(`[control-id="${id}"]`);;

        if (element && expander) {
            element.classList.toggle('Selector-Collapsed');
            expander.src = element.classList.contains('Selector-Collapsed') ? DownArrow : UpArrow;
        }
    }

    drawTexture(width, height) {
        try {
            const ctx = this.textureCanvas.getContext("2d");
            if (this.selectedObject.material && this.selectedObject.material.map && this.selectedObject.material.map.source) {
                const data = this.selectedObject.material.map.source.data;
                if (!data) {
                    return;
                }

                const backupCanvas = document.createElement("canvas");
                backupCanvas.width = data.width;
                backupCanvas.height = data.height;
                const backupCtx = backupCanvas.getContext("2d");
                backupCtx.imageSmoothingEnabled = true;
                backupCtx.imageSmoothingQuality = 'high';
                backupCtx.drawImage(data, 0, 0, backupCanvas.width, backupCanvas.height);

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                this.textureCanvas.width = width || data.width;
                this.textureCanvas.height = height || data.height;
                ctx.clearRect(0, 0, this.textureCanvas.width, this.textureCanvas.height);
                ctx.drawImage(backupCanvas, 0, 0, this.textureCanvas.width, this.textureCanvas.height);
            }
        } catch (error) {
            // Fuck it we ball
            console.log(error);
        }
    }

    selectObject(object) {
        this.selectedObject = object;
        this.drawTexture();
        this.forceUpdate();
    }

    addObject(type) {
        new THREE.TextureLoader().load('/Basic Gray.png', (texture) => {
            let object;
            switch (type) {
                case "Cube": {
                    object = new THREE.Mesh(
                        new THREE.BoxGeometry(5, 5, 5),
                    )
                    object.name = "Cube";
                    break;
                }
                case "Cone": {
                    object = new THREE.Mesh(
                        new THREE.ConeGeometry(5, 5, 5),
                    )
                    object.name = "Cone";
                    break;
                }
                case "Sphere": {
                    object = new THREE.Mesh(
                        new THREE.SphereGeometry(5, 32, 32),
                    );
                    object.name = "Sphere";
                    break;
                }
                default: {
                    object = new THREE.Mesh(
                        new THREE.BoxGeometry(5, 5, 5),
                    )
                    object.name = "Cube";
                    break;
                }
            }
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
            texture.colorSpace = THREE.SRGBColorSpace;
            object.material = new THREE.MeshBasicMaterial({ map: texture });
            object.material.needsUpdate = true;
            object.material.transparent = true;
            object.position.set(0, 0, 0);
            object.rotation.set(0, 0, 0);
            object.scale.set(1, 1, 1);
            object.castShadow = true;
            object.receiveShadow = true;
            this.scene.add(object);
            this.selectObject(object);
        });
    }



    ZoomInCanvas(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY < 0) {
            this.textureZoom += 0.1;
        } else {
            this.textureZoom -= 0.1;
        }
        this.drawTexture(this.textureCanvas.width * this.textureZoom, this.textureCanvas.height * this.textureZoom);
        this.textureZoom = 1;
        this.forceUpdate();
    }

    selectColor(e) {
        this.drawingData.color = e.target.value;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.drawingData.prevX, this.drawingData.prevY);
        ctx.lineTo(this.drawingData.currX, this.drawingData.currY);
        ctx.strokeStyle = this.drawingData.color;
        ctx.lineWidth = this.drawingData.size;
        ctx.stroke();
        ctx.closePath();


        if (this.selectedObject) {
            const texture = new THREE.Texture(this.textureCanvas);
            texture.needsUpdate = true;
            texture.colorSpace = THREE.SRGBColorSpace;
            this.selectedObject.material.map = texture;
            this.selectedObject.material.transparent = true;
            this.selectedObject.material.needsUpdate = true;
        }
    }

    findXY(res, event) {
        const ctx = this.textureCanvas.getContext('2d');
        const container = document.querySelector(`[texture-container="${this.props.id}TextureContainer"]`);
        const parent = document.querySelector(`[three-d-viewer="${this.props.id}"]`).getBoundingClientRect();


        if (res === 'Down') {
            this.drawingData.prevX = this.drawingData.currX;
            this.drawingData.prevY = this.drawingData.currY;
            this.drawingData.currX = event.clientX - this.textureCanvas.offsetLeft + container.scrollLeft - parent.x;
            this.drawingData.currY = event.clientY - this.textureCanvas.offsetTop + container.scrollTop - parent.y + 20;


            this.drawingData.flag = true;
            this.drawingData.dot_flag = true;
            if (this.drawingData.dot_flag) {
                ctx.beginPath();
                ctx.fillStyle = this.drawingData.color;
                ctx.fillRect(this.drawingData.currX, this.drawingData.currY, 2, 2);
                ctx.closePath();
                this.drawingData.dot_flag = false;
            }
        }
        if (res === 'Up' || res === "Out") {
            this.drawingData.flag = false;
            var image = new Image();
            image.src = this.textureCanvas.toDataURL();
            this.setTexture(image);
        }
        if (res === 'Move') {
            if (this.drawingData.flag) {
                this.drawingData.prevX = this.drawingData.currX;
                this.drawingData.prevY = this.drawingData.currY;
                this.drawingData.currX = event.clientX - this.textureCanvas.offsetLeft + container.scrollLeft - parent.x;
                this.drawingData.currY = event.clientY - this.textureCanvas.offsetTop + container.scrollTop - parent.y + 20;
                this.draw(ctx);
            }
        }
        this.forceUpdate();
    }

    setTexture(image) {
        if (this.selectedObject) {
            const texture = new THREE.Texture(image);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;

            if (this.selectedObject.material && this.selectedObject.material.map) {
                this.selectedObject.material.map.dispose();
                this.selectedObject.material.map = texture;
                this.selectedObject.material.transparent = true;
                this.selectedObject.material.castShadow = true;
                this.selectedObject.material.receiveShadow = true;
                this.selectedObject.material.needsUpdate = true;
            }
        }
    }

    handleTextureDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0 && this.selectedObject) {
            const file = event.dataTransfer.files[0];
            if ((file.type !== "image/png") && (file.type !== "image/jpeg")) {
                alert("Invalid file type. Please drop a PNG or JPEG image.");
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                const image = new Image();
                image.src = reader.result;
                image.onload = () => {
                    this.setTexture(image);
                    this.drawTexture();
                    this.forceUpdate();
                }
            }
            reader.readAsDataURL(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
    }


    handleObjectDrop(event) {
        event.preventDefault();
        event.stopPropagation();


        const handleFile = async (file) => {
            let fileType = file.name.split(".")[1];
            if (fileType === "") {
                const re = new RegExp("\\.(\\w+)$");
                fileType = re.exec(file.name)[1];
            }
            const reader = new FileReader();

            switch (fileType) {
                case "obj": {
                    reader.onload = () => {
                        new THREE.TextureLoader().load('/Basic Gray.png', (texture) => {
                            let object = new OBJLoader().parse(reader.result);
                            for (const child of object.children) {
                                texture.wrapS = THREE.RepeatWrapping;
                                texture.wrapT = THREE.RepeatWrapping;

                                child.material = new THREE.MeshStandardMaterial({
                                    map: texture,
                                    side: THREE.DoubleSide,
                                    transparent: true,
                                    alphaTest: 0.3,
                                });
                                child.material.needsUpdate = true;
                                child.position.set(0, 0, 0);
                                child.rotation.set(0, 0, 0);
                                child.scale.set(1, 1, 1);
                                child.castShadow = true;
                                child.receiveShadow = true;
                                const geometry = child.geometry;
                                geometry.computeBoundingBox();
                                geometry.computeBoundingSphere();
                                geometry.computeVertexNormals();
                                geometry.computeTangents();


                                if (!geometry.attributes.uv || geometry.attributes.uv.array.every(v => v === 0)) {
                                    const positions = geometry.attributes.position.array;
                                    const uvs = new Float32Array(positions.length / 3 * 2);
                                    for (let i = 0; i < positions.length / 3; i++) {
                                        uvs[i * 2] = (positions[i * 3] - geometry.boundingBox.min.x) / (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
                                        uvs[i * 2 + 1] = (positions[i * 3 + 1] - geometry.boundingBox.min.y) / (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
                                    }
                                    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
                                    geometry.uvsNeedUpdate = true;
                                }
                            }
                            this.scene.add(object);
                            this.selectObject(object);
                        });
                    }

                    reader.readAsText(file);
                    break;
                }
                case "mtl": {
                    reader.onload = () => {
                        const material = new MTLLoader().parse(reader.result);
                        console.log(material);

                        this.selectedObject.material = material.materials[0];
                        this.forceUpdate();
                    }
                    reader.readAsText(file);
                    break;
                }
                case "png":
                case "jpeg":
                case "jpg": {
                    reader.onload = () => {
                        const image = new Image();
                        image.src = reader.result;
                        image.onload = () => {
                            this.setTexture(image);
                            this.drawTexture();
                            this.forceUpdate();
                        }
                    }
                    reader.readAsDataURL(file);
                    break;
                }
                case "gltf": {
                    reader.onload = () => {
                        new GLTFLoader().parse(reader.result, "", (data) => {
                            this.scene = data.scene;
                        });
                    }
                    reader.readAsText(file);
                    break;
                }
                default:
                    alert("Invalid file type. Please drop a OBJ, MTL, PNG, JPEG, JPG file.");
                    break;
            }
        }

        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            let items = event.dataTransfer.items;
            if (items.isDirectory) {
                alert("Folder dropping is not supported. Please drop a file.");
            } else {
                for (const file of event.dataTransfer.files) {
                    handleFile(file);
                }

            }
        }
    }

    download() {
        try {
            const exporter = new OBJExporter();
            let meshes = this.scene;
            const stored = [this.scene.children[0], this.scene.children[1], this.scene.children[2], this.scene.children[3]];
            meshes.children.splice(0, 4);
            const data = exporter.parse(meshes);
            this.scene.children = [...stored, ...meshes.children];
            saveAs(new Blob([data], { type: "text/plain;charset=utf-8" }), "Anthracite Objects.obj");
        } catch (error) {
            console.error(error);
        }
    }

    render() {
        return (
            <div three-d-viewer={this.props.id} className="ThreeDViewer">
                {/* Object Selector */}
                <canvas canvas-id={this.props.id} className="Viewer-Canvas" onDrop={this.handleObjectDrop.bind(this)} onDragOver={this.handleDragOver.bind(this)}></canvas>
                <div className="Object-Selector">
                    <img caller-id={this.props.id + "-Object-Select"} src={DownArrow} className="Object-Selector-Expander" alt="" onClick={() => { this.expandObjectSelector(this.props.id + "-Object-Select") }} />
                    <div control-id={this.props.id + "-Object-Select"} className="Object-Selector-Container Selector-Collapsed" >

                        <div className="vector-item" >
                            <div className="vector-header" onClick={() => { this.collapseItem(this.props.id + "-Object-Add") }}>
                                <label htmlFor="range">{"Add Object"}</label>
                                <img src={DownArrow} caller-id={this.props.id + "-Object-Add"} alt="collapse/expand" />
                            </div>
                            <div control-id={this.props.id + "-Object-Add"} className="vector-controls collapsed ">
                                <p className="Addable-Object" onClick={() => { this.addObject('Cube'); this.collapseItem(this.props.id + "-Object-Add") }}>Cube</p>
                                <p className="Addable-Object" onClick={() => { this.addObject('Cone'); this.collapseItem(this.props.id + "-Object-Add") }}>Cone</p>
                                <p className="Addable-Object" onClick={() => { this.addObject('Sphere'); this.collapseItem(this.props.id + "-Object-Add") }}>Sphere</p>
                            </div>
                        </div>
                        {
                            this.scene && this.scene.children &&
                            this.scene.children.map((object, index) => {
                                return (
                                    <InputManager key={this.props.id + index + object} subKey={this.props.id + '-' + index + '-' + object} object={object} k={null} collapseItem={this.collapseItem.bind(this)} selectObject={this.selectObject.bind(this)} selectedObject={this.selectedObject} />
                                )
                            })
                        }
                    </div>
                </div>

                {/* Camera */}
                <div className="Viewer-Controls">
                    <div className="Scene-controls">
                        <div className="Control-Header" onClick={() => { this.collapseItem(this.props.id + "Camera") }}>
                            <p>Camera</p>
                            <img caller-id={this.props.id + "Camera"} src={DownArrow} alt="Collapse/Expand" />
                        </div>
                        <div control-id={this.props.id + "Camera"} className="Control-Container collapsed">
                            {this.camera && Object.keys(this.camera).map((key, index) => { return (<InputManager key={this.props.id + index + key} subKey={this.props.id + '-' + index + '-' + key.type} object={this.camera} k={key} collapseItem={this.collapseItem.bind(this)} />); })}
                        </div>
                    </div>

                    {/* Scene */}
                    <div className="Scene-controls">
                        <div className="Control-Header" onClick={() => { this.collapseItem(this.props.id + "Scene") }}>
                            <p>Scene</p>
                            <img caller-id={this.props.id + "Scene"} src={DownArrow} alt="Collapse/Expand" />
                        </div>
                        <div control-id={this.props.id + "Scene"} className="Control-Container collapsed">
                            {this.scene &&
                                Object.keys(this.scene).map((key, index) => {
                                    if (key && this.scene) {
                                        return (<InputManager key={this.props.id + index + key} subKey={this.props.id + '-' + index + '-' + key} object={this.scene} k={key} collapseItem={this.collapseItem.bind(this)} />);
                                    } else {
                                        return <></>;
                                    }
                                })
                            }
                        </div>
                    </div>

                    {/* Object */}
                    <div className="Scene-controls">
                        <div className="Control-Header" onClick={() => { this.collapseItem(this.props.id + "Object") }}>
                            <p>Object</p>
                            <img caller-id={this.props.id + "Object"} src={DownArrow} alt="Collapse/Expand" />
                        </div>
                        <div control-id={this.props.id + "Object"} className="Control-Container collapsed">
                            {this.selectedObject &&
                                Object.keys(this.selectedObject).map((key, index) => {
                                    if (key && this.selectedObject) {
                                        return (<InputManager key={this.props.id + index + key} subKey={this.props.id + '-' + index + '-' + key} object={this.selectedObject} k={key} collapseItem={this.collapseItem.bind(this)} />);
                                    } else {
                                        return <></>;
                                    }
                                })
                            }
                        </div>
                    </div>

                    {/* Texture */}
                    <div className="Scene-controls">
                        <div className="Control-Header" onClick={() => { this.collapseItem(this.props.id + "Texture") }}>
                            <p>Texture</p>
                            <img caller-id={this.props.id + "Texture"} src={DownArrow} alt="Collapse/Expand" />
                        </div>
                        <div control-id={this.props.id + "Texture"} className="Control-Container collapsed">
                            <div texture-container={this.props.id + "TextureContainer"} className="Texture-Canvas" onDrop={this.handleTextureDrop.bind(this)} onDragOver={this.handleDragOver.bind(this)}>
                                <canvas canvas-id={this.props.id + "Texture"} className="Control-Item"></canvas>
                            </div>
                            <div className="Texture-Color-Container">
                                <div className="control-item">
                                    <label htmlFor="Texture-Color">Texturing Color</label>
                                    <input type="color" name="Texture-Color" id="Texture-Color" onChange={this.selectColor.bind(this)} />
                                </div>
                                <br></br>
                                <InputManager object={this.drawingData} k="size" key={this.props.id + "TextureSize"} />
                            </div>
                        </div>
                    </div>
                    <div className="Control-Header" onClick={this.download.bind(this)}>
                        Export Scene As OBJ
                    </div>
                </div>
            </div >
        );
    }
}