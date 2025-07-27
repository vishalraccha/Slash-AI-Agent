import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'

const Home = () => {

    const { user } = useContext(UserContext)
    const [ isModalOpen, setIsModalOpen ] = useState(false)
    const [ projectName, setProjectName ] = useState(null)
    const [ project, setProject ] = useState([])

    const navigate = useNavigate()

    function createProject(e) {
        e.preventDefault()
        console.log({ projectName })

        axios.post('/projects/create', {
            name: projectName,
        })
            .then((res) => {
                console.log(res)
                setIsModalOpen(false)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    useEffect(() => {
        axios.get('/projects/all').then((res) => {
            setProject(res.data.projects)

        }).catch(err => {
            console.log(err)
        })

    }, [])

    return (
        <main className='p-4 bg-[#181818] w-full h-screen'>
            <div className="projects flex flex-wrap gap-3 text-white ">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="project p-4 border bg-[#1e1e1e] border-slate-300 rounded-md hover:bg-[#272727]">
                    New Project
                    <i className="ri-link ml-2"></i>
                </button>

                {
                    project.map((project) => (
                        <div key={project._id}
                            onClick={() => {
                                navigate(`/project`, {
                                    state: { project }
                                })
                            }}
                            className="project flex text-white flex-col gap-2 cursor-pointer p-4 border border-slate-300 bg-[#1e1e1e] rounded-md min-w-52 hover:bg-[#272727]">
                            <h2
                                className='font-semibold'
                            >{project.name}</h2>

                            <div className="flex gap-2">
                                <p> <small>MERN STACK PROJECT </small> :</p>
                            </div>

                        </div>
                    ))
                }


            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-slate-800 p-6 rounded-md text-white shadow-md w-1/3">
                        <h2 className="text-xl mb-4">Create New Project</h2>
                        <form onSubmit={createProject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-white-700">Project Name</label>
                                <input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    value={projectName}
                                    type="text" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div className="flex justify-end">
                                <button type="button" className="mr-2 px-4 py-2 bg-slate-700 rounded-md" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-slate-900  text-white rounded-md">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </main>
    )
}

export default Home