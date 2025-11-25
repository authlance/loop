import { Label } from '@authlance/ui/lib/browser/components/label'
import { Input } from '@authlance/ui/lib/browser/components/input'
import React from 'react'

const CreateRoleView: React.FC<{ roleName: string, setRoleName: (target: string) => void }> = ({ roleName, setRoleName }) => {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-row justify-between">
                <h2 className="text-lg font-semibold">Add Role</h2>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-0 pt-0 max-h-64 justify-center">
                <div className="flex flex-col gap-4">
                    <Label htmlFor="roleName">Role name</Label>
                    <Input type="text" id="roleName" name='roleName' value={roleName} onChange={e => setRoleName(e.target.value)} />
                </div>
            </div>
        </div>
    )
}

export default CreateRoleView
