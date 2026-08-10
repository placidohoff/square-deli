import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MenuButtons() {
    const [isShowOptions, setIsShowOptions] = useState(false)
    const navigate = useNavigate()

    const toggleOptions = () => {
        setIsShowOptions(!isShowOptions)

    }

    const OptionsForUser = () => {
        return(
            <div className='options-for-user' id='OptionsForUser'>
                <ul>
                    <li onClick={() => {navigate('/sandwiches'); setIsShowOptions(false)}}>View Sandwiches</li>
                    <li onClick={() => {navigate('/items'); setIsShowOptions(false)}}>View Other Food</li>
                    <li onClick={() => {navigate('/edit'); setIsShowOptions(false)}}>Login</li>
                </ul>
            </div>
        )
    }

    return (
        <div className="show-on-mobile mobile-options mobile-options--left">
            {
                isShowOptions && <OptionsForUser />
            }
            <div className='menu-bn' onClick={() => toggleOptions()}>
                MENU
            </div>
        </div>
    )
}
