const mockCreateChatCompletion = jest.fn().mockResolvedValue({
    choices: [{ message: { content: 'Mocked response' } }],
});

const mockLoadModelFromHF = jest.fn().mockResolvedValue(undefined);

const MockWllama = jest.fn().mockImplementation(() => ({
    createChatCompletion: mockCreateChatCompletion,
    loadModelFromHF: mockLoadModelFromHF,
}));

module.exports = {
    Wllama: MockWllama,
    WasmFromCDN: {},
    __esModule: true,
};
