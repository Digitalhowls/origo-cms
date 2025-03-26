#!/bin/bash

# Asegurarse de que existe el directorio de capturas
mkdir -p tests/screenshots

# Ejecutar las pruebas
node --experimental-vm-modules node_modules/jest/bin/jest.js --testTimeout=60000 $@