class CubeProperties  {
    position: {x: number, y: number, z: number} ={x:0, y:0, z:0}; 
    rotation: {x: number, y: number, z: number} ={x:0, y:0, z:0};
    size: {width: number, height: number, depth: number} ={width: 1, height: 1, depth: 1};
    color: {r: number, g: number, b: number} ={r: 1, g: 1, b: 1};

    constructor(position: {x: number, y: number, z: number}, rotation: {x: number, y: number, z: number}, size: {width: number, height: number, depth: number},  color: {r: number, g: number, b: number}) {
        this.position = position;
        this.rotation = rotation;
        this.size = size;
        this.color = color;
    }
}

export default CubeProperties;