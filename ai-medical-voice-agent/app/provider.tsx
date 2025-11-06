import React from 'react'
import axios from 'axios'

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>){

    const CreateNewUser=async()=>{
        const result=await axios.post('api/users');
        console.log(result);
    }

    return(
        <div>{children}</div>
    )
}

export default Provider