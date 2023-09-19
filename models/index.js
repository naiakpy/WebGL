"use strict";

const buttonX = document.querySelector("#button-x");
const buttonY = document.querySelector("#button-y");
const buttonZ = document.querySelector("#button-z");

const NumVertices = 36;

const points = [];
const colors = [];

const xAxis = 0;
const yAxis = 1;
const zAxis = 2;

let axis = 0;
const theta = [0, 0, 0];

let canvas, gl, thetaLocation;

function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    canvas = document.querySelector("#canvas");

    // Get WebGL Context
    /** @type {WebGLRenderingContext} */
    gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // Create the shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    // Absorb the GLSL into the shader
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    // Compile the shader
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    // Check any error in the GLSL syntaxes
    if (
        !gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) ||
        !gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)
    ) {
        console.log("Error Compiling Shader");
        return;
    }

    // Create a program and attach the shader
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Link the program and check if there is any error
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("Error Linking Program");
        return;
    }

    gl.useProgram(program);

    setGeometry();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLocation = gl.getUniformLocation(program, "theta");

    buttonX.addEventListener("click", () => {
        axis = xAxis;
    });

    buttonY.addEventListener("click", () => {
        axis = yAxis;
    });

    buttonZ.addEventListener("click", () => {
        axis = zAxis;
    });

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 2.0;
    gl.uniform3fv(thetaLocation, theta);

    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);

    requestAnimFrame(render);
}

function setGeometry() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
    var vertices = [
        vec4(-0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, 0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.5, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5, 0.5, -0.5, 1.0),
        vec4(0.5, 0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0),
    ];

    var vertexColors = [
        [0.0, 0.0, 0.0, 1.0], // black
        [1.0, 0.0, 0.0, 1.0], // red
        [1.0, 1.0, 0.0, 1.0], // yellow
        [0.0, 1.0, 0.0, 1.0], // green
        [0.0, 0.0, 1.0, 1.0], // blue
        [1.0, 0.0, 1.0, 1.0], // magenta
        [0.0, 1.0, 1.0, 1.0], // cyan
        [1.0, 1.0, 1.0, 1.0], // white
    ];

    // Create two triangles from the quad indices
    // Assign the color based on vertex index
    var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);
    }
}

const vertexShaderText = [
    `attribute  vec4 vPosition;
    attribute  vec4 vColor;
    varying vec4 fColor;
    
    uniform vec3 theta;
    
    void main()
    {
        // Compute the sines and cosines of theta for each of
        //   the three axes in one computation.
        vec3 angles = radians( theta );
        vec3 c = cos( angles );
        vec3 s = sin( angles );
    
        // Remeber: thse matrices are column-major
        mat4 rx = mat4( 1.0,  0.0,  0.0, 0.0,
                0.0,  c.x,  s.x, 0.0,
                0.0, -s.x,  c.x, 0.0,
                0.0,  0.0,  0.0, 1.0 );
    
        mat4 ry = mat4( c.y, 0.0, -s.y, 0.0,
                0.0, 1.0,  0.0, 0.0,
                s.y, 0.0,  c.y, 0.0,
                0.0, 0.0,  0.0, 1.0 );
    
    
        mat4 rz = mat4( c.z, s.z, 0.0, 0.0,
                -s.z,  c.z, 0.0, 0.0,
                0.0,  0.0, 1.0, 0.0,
                0.0,  0.0, 0.0, 1.0 );
    
        fColor = vColor;
        gl_Position = rz * ry * rx * vPosition;
        gl_Position.z = -gl_Position.z;
    }`,
];

const fragmentShaderText = [
    `precision mediump float;

    varying vec4 fColor;
    
    void main()
    {
        gl_FragColor = fColor;
    }`,
];

main();
