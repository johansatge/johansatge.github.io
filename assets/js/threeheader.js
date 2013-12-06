(function($)
{
    $.ThreeHeader = function(element, options)
    {
        this.settings = $.extend(true, {}, $.ThreeHeader.defaults, options);
        this.element = element;
        this.init();
    }
    $.extend($.ThreeHeader,
    {
        defaults:
        {
        },
        prototype:
        {
			container:      null,
			camera:         null,
			scene:          null,
			renderer:       null,
            materials:      null,
            first_render:   true,
            mesh:           null,
            cameraX:        0,
            cameraY:        0,

            /**
             * Initialisation de la scène
             */
            init: function()
            {
				// Scène
				this.scene = new THREE.Scene();

				// Caméra
				this.camera =               new THREE.PerspectiveCamera(45, this.settings.scene.width / this.settings.scene.height, 1, 2000);
				this.camera.position.z =    10000;

				// Lumières
				var ambient = new THREE.AmbientLight(0x999999);
				this.scene.add(ambient);
				var directional = new THREE.DirectionalLight(0xe3ded0, 0.5);
                directional.position.set(0, 0, 1);
				this.scene.add(directional);

                // Matières
                var black_material = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: false});
                var white_material = new THREE.MeshLambertMaterial({color: 0xe3ded0, wireframe: false});
                this.materials = {'atomes': black_material, 'centre': white_material};

                // Chargement du mesh
                var manager = new THREE.LoadingManager();
				var loader =    new THREE.OBJLoader(manager);
				loader.load(this.settings.mesh, $.proxy(this, 'onMeshLoaded'));

                // Rendu
                if (typeof WebGLRenderingContext != 'undefined' && window.WebGLRenderingContext)
                {
                    this.renderer = new THREE.WebGLRenderer({'antialias': this.settings.antialias});
                }
                else
                {
                    this.renderer = new THREE.CanvasRenderer({});
                }
				this.renderer.setSize(this.settings.scene.width, this.settings.scene.height);
				this.element.appendChild(this.renderer.domElement);
				$(this.element).on('mousemove', $.proxy(this,'onMouseMove'));
            },
            /**
             * Fin de chargement du mesh
             * @param mesh
             */
            onMeshLoaded: function(mesh)
            {
                var self = this;
                this.mesh = mesh;
                this.mesh.traverse(function(child)
                {
                    if (child instanceof THREE.Mesh)
                    {
                        child.material = self.materials[child.name];
                    }
                });
                this.scene.add(this.mesh);
                this.animate(true);
            },
            /**
             * Mouvement de la souris sur le container
             * @param evt
             */
			onMouseMove: function(evt)
			{
                var offset =     $(this.element).offset();
				this.cameraX =   (evt.clientX - offset.left - (this.settings.scene.width / 2)) / this.settings.animations.scale_x;
				this.cameraY =   -(evt.clientY - offset.top - (this.settings.scene.height / 2)) / this.settings.animations.scale_y;
			},
            /**
             * Animation de la scène
             * @param force_render
             */
			animate: function(force_render)
			{
				requestAnimationFrame($.proxy(this, 'animate'));
                this.render();
                this.first_render = false;
			},
            /**
             * Rendu d'une image si nécessaire (mouvement de la caméra)
             */
			render: function()
			{
                var previous_x =            this.camera.position.x;
				this.camera.position.x +=   (this.cameraX - this.camera.position.x) / this.settings.animations.move_delay;
                var previous_y =            this.camera.position.y;
				this.camera.position.y +=   (this.cameraY - this.camera.position.y) / this.settings.animations.move_delay;
                var previous_z =            this.camera.position.z;
                this.camera.position.z +=   (400 - this.camera.position.z) / this.settings.animations.intro_delay;

                if (this.hasToRender(previous_x, previous_y, previous_z))
                {
                    this.camera.lookAt(this.scene.position);
                    var projector = new THREE.Projector();

                    // Gauche
                    var position_3d_left = new THREE.Vector3(this.settings.left_anchor.x, this.settings.left_anchor.y, this.settings.left_anchor.z);
                    var position_2d_left = projector.projectVector(position_3d_left, this.camera);
                    var $left = $('.left', this.element);
                    $left.css(
                    {
                        'margin-left': (position_2d_left.x * this.settings.scene.width),
                        'margin-top':  (-position_2d_left.y * this.settings.scene.height) - 10
                    });
                    if (!$left.is(':visible'))
                    {
                        $left.delay(800).fadeIn(800);
                    }

                    // Droite
                    var position_3d_right = new THREE.Vector3(this.settings.right_anchor.x, this.settings.right_anchor.y, this.settings.right_anchor.z);
                    var position_2d_right = projector.projectVector(position_3d_right, this.camera);
                    var $right = $('.right', this.element);
                    $right.css(
                    {
                        'margin-left': (position_2d_right.x * this.settings.scene.width / 2) + 22,
                        'margin-top':  -position_2d_right.y * this.settings.scene.height / 2
                    });
                    if (!$right.is(':visible'))
                    {
                        $right.delay(800).fadeIn(800);
                    }

                    this.renderer.render(this.scene, this.camera);
                }
			},
            /**
             * Vérifie si un rendu est nécessaire
             * @param previous_x
             * @param previous_y
             * @param previous_z
             */
            hasToRender: function(previous_x, previous_y, previous_z)
            {
                if (this.fixNumber(previous_x) != this.fixNumber(this.camera.position.x))
                {
                    return true;
                }
                if (this.fixNumber(previous_y) != this.fixNumber(this.camera.position.y))
                {
                    return true;
                }
                if (this.fixNumber(previous_z) != this.fixNumber(this.camera.position.z))
                {
                    return true;
                }
                if (this.first_render)
                {
                    return true;
                }
                return false;
            },
            /**
             * Fixe un nombre à deux chiffres après la virgule
             * @param number
             */
            fixNumber: function(number)
            {
                return Math.round(number * 100) / 100;
            }
        }
    });
    $.fn.ThreeHeader = function(options)
    {
        return this.each(function()
        {
            if (undefined == $(this).data('ThreeHeader'))
            {
                $(this).data('ThreeHeader', new $.ThreeHeader(this, options));
            }
        });
    }
})(jQuery);



var debugaxis = function(axisLength){
    //Shorten the vertex function

};

//To use enter the axis length
debugaxis(100);