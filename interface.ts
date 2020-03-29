let [m6502pc,
	m6502sp,
	m6502_rega,
	m6502_regx,
	m6502_regy,
	m6502_status_bits,
	m6502_opcode,
	m6502_operand1,
	m6502_operand2,
	m6502_magicValue,
	m6502_last_bus_address,
	m6502_last_bus_value, m6502_last_bus_mode,
	m6502_instruction_ticks
] = Array(13);

		dataHeap!.set(new Uint8Array(cpu_status_data.buffer));
		const oldpc = m6502pc;

		step6502(dataHeap!.byteOffset, cpu_status_data.length);
		const result = new Uint16Array(dataHeap!.buffer, dataHeap!.byteOffset, cpu_status_data.length);

		[
			m6502pc, m6502sp, m6502_rega, m6502_regx, m6502_regy,
			m6502_status_bits, m6502_opcode, m6502_operand1,
			m6502_operand2, m6502_magicValue, m6502_last_bus_address,
			m6502_last_bus_value, m6502_last_bus_mode,
			m6502_instruction_ticks
		] = result;



	const cpu_status_data = new Uint16Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

	// Get data byte size, allocate memory on Emscripten heap, and get pointer
	const nDataBytes = cpu_status_data.length * cpu_status_data.BYTES_PER_ELEMENT;
	let dataPtr = Module._malloc(nDataBytes);

	let dataHeap: Uint8Array | null = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);

	const destroy = () => {
		if (dataHeap) {
			// Free memory
			Module._free(dataHeap.byteOffset);
			dataHeap = null;
		}












