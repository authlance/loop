import { injectable } from 'inversify'
import { DataTypes, Model, Sequelize, Optional } from 'sequelize'
import { SequelizeModelContribution } from '../data-models-manager'

// Define generic attributes that can store various transient data
interface TransientDataAttributes {
    key: string
    value: string
    expiresAt: Date | null
}

interface TransientDataCreationAttributes extends Optional<TransientDataAttributes, 'key' | 'expiresAt'> { }

export class TransientData
    extends Model<TransientDataAttributes, TransientDataCreationAttributes>
    implements TransientDataAttributes {
    public key!: string
    public value!: string
    public expiresAt!: Date | null
}

@injectable()
export class TransientDataModelContribution implements SequelizeModelContribution {
    initialize(sequelize: Sequelize): void {
        TransientData.init(
            {
                key: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                },
                value: {
                    type: DataTypes.TEXT('long'),
                    allowNull: false,
                },
                expiresAt: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    field: 'expires_at',
                },
            },
            {
                sequelize,
                modelName: 'TransientData',
                tableName: 'TRANSIENT_DATA', // Use a generic name for the table
                timestamps: false, // Set to true if you need Sequelize to add `createdAt` and `updatedAt` fields
            }
        )
    }

    configure(sequelize: Sequelize): void {
        TransientData.sync({ alter: true }).catch((error) => {
            console.error('Failed to sync transient data model:', error)
        })
    }
}
