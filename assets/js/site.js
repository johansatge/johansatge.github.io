(function(window)
{

    'use strict';

    var site = {};

    var settings = {
        mesh: 'assets/obj/abstract.obj',
        animations: {
            move_delay: 20,
            intro_delay: 7,
            scale_x: 1.5,
            scale_y: 1.2,
            z: 400
        },
        colors: {
            white: 0xffffff,
            black: 0x000000,
        }
    };
    var element = null;
    var cam = null;
    var scene = null;
    var renderer = null;
    var materials = null;
    var first_render = true;
    var mesh = null;
    var cam_x = 0;
    var cam_y = 0;

    /**
     * Inits position
     */
    site.initPosition = function()
    {
        window.addEventListener('resize', _onWindowResize);
        _onWindowResize();
    };

    /**
     * Inits
     * @param elm
     */
    site.init3D = function(elm)
    {
        element = elm;
        scene = new THREE.Scene();

        cam = new THREE.PerspectiveCamera(45, element.offsetWidth / element.offsetHeight, 1, 2000);
        cam.position.z = 10000;

        scene.add(new THREE.AmbientLight(settings.colors.white));
        var directional = new THREE.DirectionalLight(settings.colors.beige, 0.5);
        directional.position.set(0, 0, 1);
        scene.add(directional);

        materials = {
            atoms: new THREE.MeshBasicMaterial({color: settings.colors.white, wireframe: false}),
            center: new THREE.MeshLambertMaterial({color: settings.colors.black, wireframe: false, transparent: true, opacity: 0.75})
        };

        new THREE.OBJLoader(new THREE.LoadingManager()).load(settings.mesh, _onMeshLoaded);

        if (typeof window.WebGLRenderingContext !== 'undefined' && window.WebGLRenderingContext)
        {
            renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        }
        else
        {
            renderer = new THREE.CanvasRenderer({});
        }
        renderer.setSize(element.offsetWidth, element.offsetHeight);
        element.appendChild(renderer.domElement);
        document.addEventListener('mousemove', _onMouseMove);
    };

    /**
     * Resizes the window
     */
    var _onWindowResize = function()
    {
        renderer.setSize(element.offsetWidth, element.offsetHeight);
    };

    /**
     * Inits 3D when the mesh has been loaded
     * @param m
     */
    var _onMeshLoaded = function(m)
    {
        mesh = m;
        mesh.traverse(function(child)
        {
            if (child instanceof THREE.Mesh)
            {
                child.material = materials[child.name];
            }
        });
        scene.add(mesh);
        _render();
    };

    /**
     * Updates the 3D camera on mouse move
     * @param evt
     * @private
     */
    var _onMouseMove = function(evt)
    {
        cam_x = (evt.clientX - (window.innerWidth / 2)) / settings.animations.scale_x;
        cam_y = -(evt.clientY - (window.innerHeight / 2)) / settings.animations.scale_y;
    };

    /**
     * Renders a frame
     */
    var _render = function()
    {
        var prev_x = cam.position.x;
        cam.position.x += (cam_x - cam.position.x) / settings.animations.move_delay;
        var prev_y = cam.position.y;
        cam.position.y += (cam_y - cam.position.y) / settings.animations.move_delay;
        var prev_z = cam.position.z;
        cam.position.z += (settings.animations.z - cam.position.z) / settings.animations.intro_delay;
        if (_r(prev_x) !== _r(cam.position.x) || _r(prev_y) !== _r(cam.position.y) || _r(prev_z) !== _r(cam.position.z) || first_render)
        {
            cam.lookAt(scene.position);
            renderer.render(scene, cam);
            first_render = false;
        }
        requestAnimationFrame(_render);
    };

    /**
     * Rounds a coordinate
     * @param number
     */
    var _r = function(number)
    {
        return Math.round(number * 100) / 100;
    };

    window.Site = site;

})(window);