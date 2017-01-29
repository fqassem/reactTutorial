import React from 'react';
import { shallow, mount, render } from 'enzyme';

import Home from '../src/pages/Home';

describe('<Home />', () => {
    it('contains an H1 element', () => {
        const wrapper = shallow(<Home />);
        expect(wrapper.contains(<h1>Home</h1>)).to.equal(true);
    });

    it('mounts with no errors and has no props', () => {
        sinon.spy(Home.prototype, 'render');
        const wrapper = mount(<Home />);
        expect(Home.prototype.render).to.have.property('callCount', 1);
        wrapper.props().should.be.empty;
    });

    it('renders the word Home on the browser', () => {
        const wrapper = render(<Home />);
        expect(wrapper.text()).to.contain('Home');
    });
});
