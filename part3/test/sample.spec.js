describe('sample test container', () => {
    describe('sample test', () => {
        it('asserts correctly', () => {
            '10'.should.equal('10');
            expect('10').to.equal('10');
            assert.equal('10', '10');
        });
    });
});
