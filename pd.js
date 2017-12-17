(function (win, doc) {

    const POW = Math.pow,
          SQRT = Math.sqrt,
          MAX = Math.max,
          MIN = Math.min,
          ABS = Math.abs,
          SIN = Math.sin,
          COS = Math.cos,
          PI = Math.PI

    var cas = {

        init() {
            this.canvas = doc.getElementById('canvas') || doc.querySelector('canvas')
            this.$ = this.canvas.getContext('2d')
            this.w = this.canvas.width = win.innerWidth / 2
            this.h = this.canvas.height = win.innerHeight / 2
            this.startX = this.moveX = 0
            this.startY = this.moveY = 0
            this.moveShape = this.target = this.index = this.startTime = null
            this.shapeCollection = []

            this.shapeCollection.push(new Shape({
                width: 5, color: 'black',
                intersectColor: 'crimson',
                x: 150, y: 200,
                R: 60, sides: 3,
            }), new Shape({
                color: 'black', width: 5,
                intersectColor: 'cyan',
                x: 500, y: 350,
                R: 38, type: 'circle',
            }), new Shape({
                width: 5, color: 'black',
                intersectColor: 'violet',
                x: 300, y: 350,
                R: 80, sides: 7
            }), new Shape({
                width: 5, color: 'black',
                intersectColor: 'yellowgreen',
                x: 450, y: 100,
                R: 50, sides: 6,
            }), new Shape({
                color: 'black', width: 5,
                intersectColor: 'indigo',
                x: 650, y: 200,
                R: 65, type: 'circle',
            }), new Shape({
                color: 'black', width: 5,
                intersectColor: 'blue',
                x: 550, y: 350,
                R: 50, sides: 9
            }))

            this.traversalComparsion()
            this.bindEvent(this)
        },

        drawThis(a){
            a.type ? a.drawCircle() : a.drawPolygon()
        },

        clear(){
            this.$.clearRect(0, 0, this.w, this.h)
        },

        bindEvent(){
            this.canvas.addEventListener(
                'mousedown',
                this.captureGraphic.bind(this),
                false)

            this.canvas.addEventListener(
                'touchstart',
                this.captureGraphic.bind(this),
                false)
        },

        captureGraphic(e){
            this.startX = e.offsetX || e.targetTouches[0].clientX

            this.startY = e.offsetY || e.targetTouches[0].clientY

            this.clear()

            for (let i = 0; i < this.shapeCollection.length; ++i) {

                this.drawThis(this.shapeCollection[i])

                if (this.$.isPointInPath(this.startX, this.startY)) {

                    this.moveShape = this.shapeCollection[i]

                    this.index = i

                    this.proceedEvent()

                    this.startTime = Date.now()
                }
            }
        },

        proceedEvent(){
            var dragShape2 = this.dragShape.bind(this)

            this.canvas.addEventListener('mousemove', dragShape2, false)

            this.canvas.addEventListener('touchmove', dragShape2, false)

            this.canvas.addEventListener(
                'mouseup',
                () => this.canvas.removeEventListener('mousemove', dragShape2,
                    false))

            this.canvas.addEventListener('touchend',
                () => this.canvas.removeEventListener('touchmove', dragShape2,
                    false))
        },

        dragShape(e){

            this.moveX = e.offsetX || e.targetTouches[0].clientX

            this.moveY = e.offsetY || e.targetTouches[0].clientY

            if (Date.now() - this.startTime > 1000 / 60) {

                this.moveShape._X += this.moveX - this.startX

                this.moveShape._Y += this.moveY - this.startY

                this.startX = this.moveX

                this.startY = this.moveY

                this.clear()

                this.traversalComparsion()

                this.startTime = Date.now()

            }
        },

        traversalComparsion(){

            for (let i = 0; i < this.shapeCollection.length; i++) {

                if (i === this.index || this.index === null) {

                    for (let j = 0; j < this.shapeCollection.length; j++) {

                        if (j === this.index) {

                            continue
                        }

                        this.target = this.moveShape || this.shapeCollection[i]

                        if (this.mutualCollision(this.target, this.shapeCollection[j])) {

                            this.target.changeC = this.shapeCollection[j].changeC = true

                            if (Number.isInteger(this.index)) {

                                break
                            }

                        } else {

                            this.target.changeC = this.shapeCollection[j].changeC = false
                        }
                    }
                }
                this.drawThis(this.shapeCollection[i])
            }
        },

        mutualCollision(a, b){

            if (!a.type && !b.type) {

                return !(this.polygonCollision(a, b) || this.polygonCollision(b, a))

            } else if (a.type && b.type) {

                return this.circleCollision(a, b)

            } else {

                return a.type ?

                    this.circlePolygonCollision(a, b) :

                    this.circlePolygonCollision(b, a)

            }
        },

        circleCollision(a, b){
            return SQRT(POW(b._Y - a._Y, 2) + POW(b._X - a._X, 2)) < a._R + b._R
        },

        polygonCollision(a, b){
            var vec1 = a.verticesCoordinate,
                vec2 = b.verticesCoordinate,
                K = [],
                i, l,
                referA = new Vector([])
            referB = new Vector([])
            for (i = 0, l = vec1.length; i < l; i++) {
                if (i === l - 1) {
                    K.push((vec1[0][1] - vec1[i][1]) / (vec1[0][0] - vec1[i][0]))
                } else {
                    K.push((vec1[i + 1][1] - vec1[i][1]) / (vec1[i + 1][0] - vec1[i][0]))
                }
            }
            for (i = 0, l = K.length; i < l; i++) {
                [
                    referA.X,
                    referB.X
                ] = [
                    this.getReferCoordinate(vec1, K[i]),
                    this.getReferCoordinate(vec2, K[i], b._X, b._Y)
                ]

                referA.Y = referA.X.map(e => -1 / K[i] * e)
                referB.Y = referB.X.map(e => -1 / K[i] * e)

                if (
                    (MIN(...referA.X) > MAX(...referB.X) || MAX(...referA.X) < MIN(...referB.X))
                ) {
                    return true
                }
            }
            return false
        },

        getReferCoordinate(vec, slope){
            var collectionX = []
            for (let j = 0, l = vec.length; j < l; j++) {
                collectionX.push(slope * (slope * vec[j][0] - vec[j][1]) / (slope * slope + 1))
            }
            return collectionX
        },

        circlePolygonCollision(a, b){
            var K = [],
                vec = b.verticesCoordinate,
                i, l, noIntersect,
                cirX = a._X,
                cirY = a._Y
            for (i = 0, l = vec.length; i < l; i++) {
                noIntersect = true

                K.push((cirY - vec[i][1]) / (cirX - vec[i][0]))

                let [
                    MAXCX,
                    MINCX ] = [
                    cirX + SQRT(POW(a._R, 2) / (1 + POW(K[i], 2))),
                    cirX - SQRT(POW(a._R, 2) / (1 + POW(K[i], 2)))
                ]

                for (let j = 0; j < l; j++) {
                    //__X为多边形各端点在圆中心与多边形各端点所构成的直线方程上投影点的横坐标
                    let __x = (vec[j][0] + K[i] * vec[j][1] + POW(K[i], 2) * cirX - K[i] * cirY) / (POW(K[i], 2) + 1)

                    if (__x < MAXCX && __x > MINCX) {

                        noIntersect = false

                        break
                    }
                }
                if (noIntersect) {
                    return false
                }
            }
            return true
        },

        getpolygonClosestVertices(a, b){
            var vec = b.verticesCoordinate,
                len = Number.MAX_VALUE,
                polygonClosestVertices

            vec.forEach(e => {
                let verticesDistance = POW(a._X - e[0], 2) + POW(a._Y - e[1], 2)
                if (verticesDistance < len) {
                    len = verticesDistance
                    polygonClosestVertices = new Vector(...e)
                }
            })
            return polygonClosestVertices
        }
    }

    var Vector = class {
        constructor(x, y) {
            this.X = x
            this.Y = y
        }
    }

    var Shape = new Proxy(class {
        constructor(conf) {
            this.strokeWidth = conf.width
            this.defaultColor = conf.color
            this.intersectColor = conf.intersectColor
            this._X = conf.x
            this._Y = conf.y
            this._R = conf.R
            this.sides = conf.sides
            this.concavity = conf.concavity
            this.vertices = []
            this.type = conf.type
            this.changeC = false
            !this.type && this.getPolygonVertices(
                this.sides,
                this._R,
                this.concavity,
                this.vertices,
                this.polygonVerticesFixed
            )

        }

        desColor() {
            return this.changeC ? this.intersectColor : this.defaultColor
        }

        getPolygonVertices
        (sides,
         radius,
         concavity,
         vertices,
         fn) {
            for (let k = 0, ata = 2 * PI / sides; k < sides; k++) {
                vertices.push([
                    COS(k * ata) * radius,
                    SIN(k * ata) * radius,
                ])

                if (Number.isFinite(concavity)) {
                    vertices.push([
                        COS((k + .5) * ata) * radius * (1 - concavity),
                        SIN((k + .5) * ata) * radius * (1 - concavity),
                    ]);
                }
            }
            fn && fn.call(this)
        }

        drawPolygon() {

            this.polygonAvoidBoundary()

            cas.$.beginPath()

            cas.$.lineWidth = this.strokeWidth

            cas.$.strokeStyle = this.desColor()

            for (let i = 0, len = this.vertices.length; i < len; i++) {

                cas.$.lineTo(this.vertices[i][0] + this._X, this.vertices[i][1] + this._Y);

            }

            cas.$.lineTo(this._R + this._X, this._Y);

            cas.$.stroke()

            cas.$.closePath()

        }

        polygonVerticesFixed() {
            var v = []

            for (let i = 0, l = this.vertices.length; i < l; i++) {
                v.push([
                    this.vertices[i][0] + this._X,
                    this.vertices[i][1] + this._Y,
                ])
            }
            this.verticesCoordinate = v

        }

        drawCircle() {
            this.circleAvoidBoundary()

            cas.$.beginPath()

            cas.$.strokeStyle = this.desColor()

            cas.$.moveTo(this._X + this._R, this._Y)

            cas.$.arc(this._X, this._Y, this._R, 0, 2 * PI)

            cas.$.stroke()

            cas.$.closePath()
        }

        circleAvoidBoundary() {
            if (this._X < this._R + this.strokeWidth) {
                this._X = this._R + this.strokeWidth
            }
            if (this._X + this._R + this.strokeWidth > cas.w) {
                this._X = cas.w - this._R - this.strokeWidth
            }
            if (this._Y < this._R + this.strokeWidth) {
                this._Y = this._R + this.strokeWidth
            }
            if (this._Y + this._R + this.strokeWidth > cas.h) {
                this._Y = cas.h - this._R - this.strokeWidth
            }

        }

        polygonAvoidBoundary() {
            var _XY = [[], []],
                border = this.strokeWidth

            if (!this.verticesCoordinate) {
                this.polygonVerticesFixed()
            }

            this.verticesCoordinate.forEach(e=> {
                _XY[0].push(e[0])
                _XY[1].push(e[1])
            })

            let _minCX = MIN(..._XY[0]),
                _maxCX = MAX(..._XY[0]),
                _minCY = MIN(..._XY[1]),
                _maxCY = MAX(..._XY[1])

            if (_minCX - border < 0) {
                this._X += ABS(_minCX)
            }
            if (_maxCX + border > cas.w) {
                this._X -= ABS(cas.w - _maxCX)
            }
            if (_minCY - border < 0) {
                this._Y += ABS(_minCY)
            }
            if (_maxCY + border > cas.h) {
                this._Y -= ABS(cas.h - _maxCY)
            }

            this.polygonVerticesFixed()
        }
    }, {
        construct(target, args){
            var conf = args[0]
            if (conf.R > 200 || conf.R < 1) {
                conf.R = 50
            }
            if (conf.x > cas.w - conf.R || conf.x < conf.R) {
                conf.x = 100
            }
            if (conf.y > cas.h - conf.R || conf.y < conf.R) {
                conf.y = 100 * cas.h / cas.w
            }
            return new target(conf)
        }
    })

    cas.init()

})
(this, this.document)


//circlePolygonCollision(a, b){
//    var vec = b.verticesCoordinate,
//        polygonClosestVertices,
//        len = Number.MAX_VALUE,
//        centerK = (b._Y - a._Y) / (b._X - a._X),
//        circleK,
//        contactWithCircle,
//        referX,
//        refer_X
//    vec.forEach( e => {
//        let verticesDistance = POW(a._X - e[0], 2) + POW(a._Y - e[1], 2)
//        if (verticesDistance < len) {
//            len = verticesDistance
//            polygonClosestVertices = new Vector(...e)
//        }
//    })
//
//    circleK = (a._Y - polygonClosestVertices.Y) / (a._X - polygonClosestVertices.X)
//
//    let x5 = a._X - SQRT(POW(a._R, 2) / (1 + POW(circleK, 2))),
//        y5 = a._Y - circleK * SQRT(POW(a._R, 2) / (1 + POW(circleK, 2))),
//        x6 = a._X + SQRT(POW(a._R, 2) / (1 + POW(circleK, 2))),
//        y6 = a._Y + circleK * SQRT(POW(a._R, 2) / (1 + POW(circleK, 2)))
//
//    if (POW(x5 - polygonClosestVertices.X, 2) + POW(y5 - polygonClosestVertices.Y, 2) > POW(x6 - polygonClosestVertices.X, 2) + POW(y6 - polygonClosestVertices.Y, 2)) {
//        contactWithCircle = new Vector(x6, y6)
//    } else {
//        contactWithCircle = new Vector(x5, y5)
//    }
//
//    referX = (polygonClosestVertices.X + centerK * (polygonClosestVertices.Y - a._Y) + POW(centerK, 2) * a._X) / (POW(centerK, 2) + 1)
//    refer_X = (contactWithCircle.X + centerK * (contactWithCircle.Y - a._Y) + POW(centerK, 2) * a._X) / (POW(centerK, 2) + 1)
//
//    console.log(referX, refer_X)
//
//    if (a._X > b._X) {
//        if (refer_X > referX) {
//            return false
//        } else {
//            return true
//        }
//    } else {
//        if (refer_X > referX) {
//            return true
//        } else {
//            return false
//        }
//    }
//}