import {configureStore} from '@reduxjs/toolkit'
import earthquakeSlice from './earthquakeSlice.js'
import locationSlice from './locationSlice.js'

const store = configureStore({
    reducer: {
        earthquake: earthquakeSlice,
        location: locationSlice
    }
});

export default store;