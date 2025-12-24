import * as THREE from 'three';

export interface House3DConfig {
  containerId: string;
  showWalls?: boolean;
  showRoof?: boolean;
  animateRotation?: boolean;
}

export class House3D {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private house: THREE.Group;
  private animationId: number | null = null;
  private container: HTMLElement;
  private rotationEnabled: boolean = false;

  constructor(config: House3DConfig) {
    this.container = document.getElementById(config.containerId)!;
    if (!this.container) {
      throw new Error(`Container with id "${config.containerId}" not found`);
    }

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Dark navy background

    // Camera setup
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(2, 2, 3);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Create house
    this.house = new THREE.Group();
    this.scene.add(this.house);

    if (config.showWalls !== false) {
      this.createWalls();
    }
    if (config.showRoof !== false) {
      this.createRoof();
    }
    this.createFoundation();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Start animation loop
    this.animate();

    if (config.animateRotation) {
      this.rotationEnabled = true;
    }
  }

  private createWalls(): void {
    // Main walls (using simple boxes for now)
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8d5b7, // Warm brick color
      roughness: 0.8,
      metalness: 0.1
    });

    // Front and back walls
    const frontWall = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1.5, 0.1),
      wallMaterial
    );
    frontWall.position.z = 1;
    frontWall.castShadow = true;
    frontWall.receiveShadow = true;
    this.house.add(frontWall);

    // Left and right walls
    const sideWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.5, 2),
      wallMaterial
    );
    sideWall.position.x = 1;
    sideWall.castShadow = true;
    sideWall.receiveShadow = true;
    this.house.add(sideWall);

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.5, 2),
      wallMaterial
    );
    rightWall.position.x = -1;
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    this.house.add(rightWall);

    // Door
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513, // Brown
      roughness: 0.6,
      metalness: 0.3
    });
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.8, 0.05),
      doorMaterial
    );
    door.position.set(0, -0.35, 1.05);
    door.castShadow = true;
    door.receiveShadow = true;
    this.house.add(door);

    // Windows (simple planes)
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb, // Sky blue glass
      roughness: 0.3,
      metalness: 0.5,
      transparent: true,
      opacity: 0.7
    });

    for (let i = -1; i <= 1; i += 1) {
      const window = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.3, 0.05),
        windowMaterial
      );
      window.position.set(i * 0.6, 0.3, 1.05);
      window.castShadow = true;
      this.house.add(window);
    }
  }

  private createRoof(): void {
    // Pitched roof
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0xc41e3a, // Red roof
      roughness: 0.9,
      metalness: 0
    });

    const roofGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Front triangle
      -1, 1.5, 1,
      1, 1.5, 1,
      0, 2.3, 1,
      // Back triangle
      -1, 1.5, -1,
      1, 1.5, -1,
      0, 2.3, -1,
      // Front to back left
      -1, 1.5, 1,
      -1, 1.5, -1,
      0, 2.3, -1,
      0, 2.3, 1,
      // Front to back right
      1, 1.5, 1,
      1, 1.5, -1,
      0, 2.3, -1,
      0, 2.3, 1
    ]);

    const indices = new Uint32Array([
      0, 1, 2,    // front
      3, 5, 4,    // back
      6, 7, 8, 8, 9, 6,  // left slope
      10, 12, 11, 11, 12, 13  // right slope
    ]);

    roofGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    roofGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
    roofGeometry.computeVertexNormals();

    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.castShadow = true;
    roof.receiveShadow = true;
    this.house.add(roof);
  }

  private createFoundation(): void {
    const foundationMaterial = new THREE.MeshStandardMaterial({
      color: 0x696969, // Gray concrete
      roughness: 0.9,
      metalness: 0
    });

    const foundation = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.2, 2.2),
      foundationMaterial
    );
    foundation.position.y = -0.75;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    this.house.add(foundation);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    if (this.rotationEnabled) {
      this.house.rotation.y += 0.005;
    }

    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize = (): void => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  public setRotation(enabled: boolean): void {
    this.rotationEnabled = enabled;
  }

  public setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }

  public destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
