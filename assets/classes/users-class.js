let db, config

// Le require() envoie une fonction envoyant la class Members
// Permettant de définir des constantes dans le module venant du fichier principal
module.exports = (_db, _config) => {
    db = _db
    config = _config
    return Users
}

let Users     = class {

    // Envoie un utilisateur via son ID
    static getByID(id) {

        return new Promise((next) => {

            db.query('SELECT * FROM users WHERE id = ?', [id])
                .then((result) => {
                    if (result[0] != undefined)
                        next(result[0])
                    else
                        next(new Error(config.errors.wrongID))
                })
                .catch((err) => next(err))

        })

    }

    // Envoie tous les utilisateur (avec un maximum optionnel)
    static getAll(max) {

        return new Promise((next) => {

            if (max != undefined && max > 0) {
                db.query('SELECT * FROM users LIMIT 0, ?', [parseInt(max)])
                    .then((result) => next(result))
                    .catch((err) => next(err))
            } else if (max != undefined) {
                next(new Error('Wrong max value'))
            } else {
                db.query('SELECT * FROM users')
                    .then((result) => next(result))
                    .catch((err) => next(err))

            }
        })

    }

    // Ajoute un utilisateur avec son nom comme paramètre
    static add(lastName) {

        return new Promise((next) => {

            if (lastName != undefined && lastName.trim() != '') {

                lastName = lastName.trim()

                db.query('SELECT * FROM users WHERE lastName = ?', [lastName])
                    .then((result) => {
                        if (result[0] != undefined) {
                            next(new Error(config.errors.nameAlreadyTaken))
                        } else {
                            return db.query('INSERT INTO users(lastName) VALUES(?)', [lastName])
                            const lastName = req.body.lastName
                            const firstName = req.body.email
                            const email = req.body.lastName
                            const password = req.body.password
                            // return db.query('INSERT INTO users(`lastName`, `firstName`, `email`, `password`) VALUES (?,?,?,?)',[lastName, firstName, email, password])
                        }
                    })
                    .then(() => {
                        return db.query('SELECT * FROM users WHERE lastName = ?', [lastName])
                    })
                    .then((result) => {
                        next({
                            id: result[0].id,
                            lastName: result[0].lastName
                        })
                    })
                    .catch((err) => next(err))

            } else {
                next(new Error(config.errors.noNameValue))
            }

        })

    }

    // Modifie le nom d'un utilisateur via son ID
    static update(id, lastName) {

        return new Promise((next) => {

            if (lastName != undefined && lastName.trim() != '') {

                lastName = lastName.trim()

                db.query('SELECT * FROM users WHERE id = ?', [id])
                    .then((result) => {
                        if (result[0] != undefined) {
                            return db.query('SELECT * FROM users WHERE lastName = ? AND id != ?', [lastName, id])
                        } else {
                            next(new Error(config.errors.wrongID))
                        }
                    })
                    .then((result) => {
                        if (result[0] != undefined) {
                            next(new Error(config.errors.sameName))
                        } else {
                            return db.query('UPDATE users SET lastName = ? WHERE id = ?', [lastName, id])
                        }
                    })
                    .then(() => next(true))
                    .catch((err) => next(err))

            } else {
                next(new Error(config.errors.noNameValue))
            }

        })

    }

    // Supprime un utilisateur via son ID
    static delete(id) {

        return new Promise((next) => {

            db.query('SELECT * FROM users WHERE id = ?', [id])
                .then((result) => {
                    if (result[0] != undefined) {
                        return db.query('DELETE FROM lastName WHERE id = ?', [id])
                    } else {
                        next(new Error(config.errors.wrongID))
                    }
                })
                .then(() => next(true))
                .catch((err) => next(err))

        })

    }

}