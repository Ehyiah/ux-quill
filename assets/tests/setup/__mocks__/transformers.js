const pipeline = jest.fn().mockResolvedValue(jest.fn().mockResolvedValue([{ generated_text: 'mocked response' }]));

module.exports = { pipeline };
