import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Home from '../src/pages/Home';

describe('Home page', () => {
    it('renders with no errors', () => {
        const wrapper = shallow(<Home />);
        expect(wrapper.type()).to.equal('div');
    });
});
