import React, { useState, useRef, useEffect } from 'react';

const Timer = () => {
    const Ref = useRef(null);

    const [timer, setTimer] = useState('00:00:00');

    const getTimeRemaining = (e) => {
        const total = Date.parse(e) - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor ((total / 1000 / 60 / 60) % 24);
        return {
            total, hours, minutes, seconds
        };
    }

    const startTimer = (e) => {
        let { total, hours, minutes, seconds }
                = getTimeRemaining(e);
        if(total >= 0) {
            setTimer(
                (hours > 9 ? hours : '0' + hours) + ':' + 
                (minutes > 9 ? minutes : '0' + minutes) + ':'
                + (seconds > 9 ? seconds : '0' + seconds)
            )
        }
    }
}

export default Timer