import React, { useState } from "react";
import axios from 'axios';
import './searchDoctor.css';


function SearchDoctor(){
    const [searchValue, setSearchValue] = useState('');
    const handleSearch = () => {
        axios.post('http://localhost:8000/search_doctor/', { searchValue })
        .then(response => {
            console.log(response)
        })
        .catch(error => {
            console.error('Error:',error);
        });
    }
    return (
        <div className='search-doctor-container'>
            <div className='search-container'>
                <input 
                    type="text"
                    placeholder = "Search by name or specialization"
                    value = {searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                <button type="submit" onClick={handleSearch}>Search</button>
            </div>
        </div>
    )

}
export default SearchDoctor;