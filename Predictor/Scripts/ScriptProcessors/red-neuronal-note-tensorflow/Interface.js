Content.makeFrontInterface(600, 400);


// Capa 1: dense
const WEIGHTS_LAYER_1 = [
    [-0.176, -0.061, 0.157, 0.241, -0.015, -0.009, -0.265, -0.017, -0.095, -0.020, -0.019, 0.261, -0.286, 0.133, 0.133, -0.198, -0.018, 0.280, -0.018, -0.169, -0.022, -0.355, -0.017, 0.181, 0.105, -0.218, -0.019, -0.419, -0.021, -0.288, 0.076, -0.205, -0.224, 0.212, -0.018, 0.040, -0.018, -0.017, -0.020, 0.133, -0.019, -0.020, 0.023, -0.016, -0.018, 0.087, 0.131, 0.285, -0.022, -0.420, -0.016, -0.017, 0.140, -0.275, -0.395, -0.004, -0.016, -0.319, -0.019, -0.018, -0.018, 0.024, 0.268, -0.479],
    [-0.200, 0.180, -0.124, 0.352, 0.047, -0.037, -0.195, -0.274, 0.189, 0.143, 0.111, -0.226, 0.048, -0.202, -0.163, 0.204, -0.153, -0.099, -0.128, 0.004, 0.224, 0.096, -0.054, 0.088, -0.020, -0.170, 0.163, 0.308, 0.279, -0.064, 0.186, 0.138, 0.044, -0.233, -0.060, 0.149, 0.150, 0.112, 0.0003, 0.095, 0.142, 0.214, -0.160, -0.123, 0.167, 0.079, 0.140, 0.190, 0.011, -0.00039, 0.206, 0.00043, 0.209, 0.226, 0.350, -0.043, 0.127, 0.164, 0.057, 0.095, 0.072, 0.213, -0.179, 0.178],
    [-0.036, 0.220, -0.131, -0.309, -0.144, 0.116, -0.013, 0.199, 0.261, 0.012, 0.041, -0.013, -0.131, 0.163, -0.178, -0.055, 0.322, -0.090, -0.019, -0.00016, -0.087, 0.012, 0.218, 0.042, -0.052, -0.033, -0.184, -0.141, -0.168, 0.184, -0.064, 0.033, 0.133, 0.138, -0.143, -0.016, -0.017, 0.102, 0.167, -0.133, 0.010, -0.073, 0.115, 0.272, -0.273, 0.058, 0.015, -0.240, 0.085, 0.172, 0.235, 0.136, 0.212, -0.078, -0.180, 0.043, -0.00059, -0.008, 0.221, 0.071, -0.182, -0.096, -0.018, 0.019]
];
const BIAS_LAYER_1 = [
    0.374, 0.339, 0.479, 0.415, 0.358, 0.191, 0.355, 0.482, 0.318, 0.454, 0.398, 0.461, 0.298, 0.432, 0.494, 0.279, 0.447, 0.464, 0.487, -0.055, 0.469, 0.213, 0.383, 0.375, 0.456, 0.342, 0.472, 0.258, 0.448, 0.202, 0.431, 0.332, 0.345, 0.435, 0.526, 0.422, 0.405, 0.388, 0.378, 0.440, 0.443, 0.470, 0.456, 0.394, 0.383, 0.393, 0.390, 0.452, 0.570, 0.285, 0.343, 0.306, 0.377, 0.255, 0.269, -0.034, 0.316, 0.266, 0.340, 0.442, 0.472, 0.426, 0.469, 0.319
];

// Capa 2: dense_1
const WEIGHTS_LAYER_2 = [
    [0.180, 0.069, -0.070, -0.091, 0.054, -0.186],
    [-0.160, 0.065, 0.151, -0.134, 0.232, 0.013],
    [0.154, 0.226, 0.112, 0.241, 0.031, -0.056],
    [0.161, 0.329, -0.105, -0.175, 0.289, 0.135],
    [0.266, 0.313, -0.075, 0.040, 0.238, 0.0002],
    [-0.192, 0.275, -0.043, -0.082, 0.024, -0.221]
];
const BIAS_LAYER_2 = [
    -0.071, 0.275, -0.044, 0.312, 0.238, 0.238
];

// Capa 3: dense_2
const WEIGHTS_LAYER_3 = [
    [-0.474], [0.301], [-0.137], [0.214], [0.391], [0.388]
];
const BIAS_LAYER_3 = [0.185];

// Función para calcular la salida de una capa densa
function denseLayer(input, weights, bias)
{
    var output = [];
    for (var i = 0; i < weights.length; i++)
    {
        var sum = bias[i];
        for (var j = 0; j < input.length; j++)
        {
            sum += input[j] * weights[i][j];
        }
        output.push(sum > 0 ? sum : 0); // Activación ReLU
    }
    return output;
}

// Función para calcular la salida final de la red
function predictNewPitch(features)
{
    // Capa 1
    var layer1_output = denseLayer(features, WEIGHTS_LAYER_1, BIAS_LAYER_1);
    
    // Capa 2
    var layer2_output = denseLayer(layer1_output, WEIGHTS_LAYER_2, BIAS_LAYER_2);

    // Capa 3 (última, sin ReLU)
    var final_output = [];
    for (var i = 0; i < WEIGHTS_LAYER_3.length; i++)
    {
        var sum = BIAS_LAYER_3[0];
        for (var j = 0; j < layer2_output.length; j++)
        {
            sum += layer2_output[j] * WEIGHTS_LAYER_3[i][j];
        }
        final_output.push(sum);
    }

    // La salida es la nueva nota predicha
    return Math.max(0, Math.min(127, Math.round(final_output[0]))); // Limitar al rango MIDI
}




function onNoteOn()
{
    var currentTime = Engine.getUptime(); // Tiempo actual en segundos
    var pitch = Message.getNoteNumber(); // Nota MIDI actual

    // Características de entrada
    var timeSinceLastPressed = currentTime - lastNoteTime;
    local lastNoteTime = currentTime;
    var octave = Math.floor(pitch / 12);

    // Predecir nueva nota
    var features = [timeSinceLastPressed, pitch, octave];
    var newPitch = predictNewPitch(features);

    // Cambiar la nota actual por la predicha
    Message.setNoteNumber(newPitch);

    // Debug
    Console.print("Pitch Original: " + pitch + ", Nueva Pitch: " + newPitch);
}function onNoteOff()
{
	
}
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 