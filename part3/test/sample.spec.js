import React from 'react';
import { mount } from 'enzyme';

import Home from '../src/pages/Home';

describe('<Home />', () => {
    it('renders with no errors', () => {
        sinon.spy(Home.prototype, 'render');
        const wrapper = mount(<Home />);
        expect(Home.prototype.render).to.have.property('callCount', 1);
    });
});
