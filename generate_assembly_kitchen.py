import bpy
import bmesh
import math
import os

def clear_scene():
    # Force object mode
    if bpy.ops.object.mode_set.poll():
        bpy.ops.object.mode_set(mode='OBJECT')
    # Delete all mesh objects
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def create_material(name, color, roughness, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
    return mat

def create_box_mesh(name, width, height, depth, x, y, z, mat=None, pivot_mode='center'):
    # Create object and link to collection
    mesh = bpy.data.meshes.new(name + "_mesh")
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    
    # Fill bmesh with box geometry
    bm = bmesh.new()
    
    # Calculate offset depending on pivot
    # 'center': local origin is at center of box
    # 'hinge_l': local origin is at left vertical edge on X, back on Y, bottom on Z
    # 'hinge_r': local origin is at right vertical edge on X, back on Y, bottom on Z
    # 'drawer': local origin is at back wall on Y, center on X, bottom on Z
    
    w_half = width / 2.0
    h_half = height / 2.0
    d_half = depth / 2.0
    
    if pivot_mode == 'center':
        bmesh.ops.create_cube(bm, size=1.0)
        # scale to dimensions
        bmesh.ops.scale(bm, vec=(width, depth, height), verts=bm.verts)
    elif pivot_mode == 'hinge_l':
        # origin is at (0, 0, 0)
        # vertices are in local range: X [0, width], Y [0, depth], Z [0, height]
        for v in [
            (0, 0, 0), (width, 0, 0), (width, depth, 0), (0, depth, 0),
            (0, 0, height), (width, 0, height), (width, depth, height), (0, depth, height)
        ]:
            bm.verts.new(v)
        bm.verts.ensure_lookup_table()
        # Create faces
        faces = [
            [0, 1, 2, 3], # Bottom
            [4, 7, 6, 5], # Top
            [0, 4, 5, 1], # Front
            [1, 5, 6, 2], # Right
            [2, 6, 7, 3], # Back
            [3, 7, 4, 0]  # Left
        ]
        for f in faces:
            bm.faces.new([bm.verts[i] for i in f])
    elif pivot_mode == 'hinge_r':
        # origin is at (0, 0, 0)
        # vertices are in local range: X [-width, 0], Y [0, depth], Z [0, height]
        for v in [
            (-width, 0, 0), (0, 0, 0), (0, depth, 0), (-width, depth, 0),
            (-width, 0, height), (0, 0, height), (0, depth, height), (-width, depth, height)
        ]:
            bm.verts.new(v)
        bm.verts.ensure_lookup_table()
        faces = [
            [0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]
        ]
        for f in faces:
            bm.faces.new([bm.verts[i] for i in f])
    elif pivot_mode == 'drawer':
        # origin is at (0, 0, 0)
        # vertices are in local range: X [-width/2, width/2], Y [0, depth], Z [0, height]
        for v in [
            (-w_half, 0, 0), (w_half, 0, 0), (w_half, depth, 0), (-w_half, depth, 0),
            (-w_half, 0, height), (w_half, 0, height), (w_half, depth, height), (-w_half, depth, height)
        ]:
            bm.verts.new(v)
        bm.verts.ensure_lookup_table()
        faces = [
            [0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]
        ]
        for f in faces:
            bm.faces.new([bm.verts[i] for i in f])
            
    bm.to_mesh(mesh)
    bm.free()
    
    # Assign material
    if mat:
        obj.data.materials.append(mat)
        
    # Translate object to world position
    obj.location = (x, y, z)
    return obj

def build_assembly_kitchen():
    clear_scene()
    
    # Materials
    mat_carcass = create_material("mat_carcass", (0.15, 0.15, 0.15, 1.0), 0.4) # Dark graphite wood
    mat_facade = create_material("mat_facade", (0.75, 0.12, 0.12, 1.0), 0.15) # Premium glossy red
    mat_countertop = create_material("mat_countertop", (0.9, 0.9, 0.9, 1.0), 0.1) # Quartz marble
    mat_backsplash = create_material("mat_backsplash", (0.05, 0.05, 0.05, 1.0), 0.5) # Black matte backsplash
    mat_handles = create_material("mat_handles", (0.8, 0.6, 0.2, 1.0), 0.2, metallic=0.9) # Gold metallic handles
    mat_appliances = create_material("mat_appliances", (0.02, 0.02, 0.02, 1.0), 0.1, metallic=0.8) # Brushed black metal / glass
    
    # Cabinet module configuration
    cab_w = 0.8  # Width of one cabinet module (80cm)
    cab_h = 0.72 # Height of carcass
    cab_d = 0.56 # Depth of carcass
    plinth_h = 0.1 # Plinth height
    
    # --- 1. FRAMES (Frame_*) ---
    # Plinth base
    create_box_mesh("Frame_Plinth", cab_w * 3, plinth_h, cab_d - 0.02, 0, 0, plinth_h / 2, mat_carcass)
    
    # Lower Carcasses (3 modules)
    # Left Cabinet Frame (Modules from X = -1.2 to +1.2)
    create_box_mesh("Frame_Cabinet_Lower_1", cab_w, cab_h, cab_d, -cab_w, 0, plinth_h + cab_h / 2, mat_carcass)
    # Middle Cabinet Frame
    create_box_mesh("Frame_Cabinet_Lower_2", cab_w, cab_h, cab_d, 0, 0, plinth_h + cab_h / 2, mat_carcass)
    # Right Cabinet Frame (For Oven)
    create_box_mesh("Frame_Cabinet_Lower_3", cab_w, cab_h, cab_d, cab_w, 0, plinth_h + cab_h / 2, mat_carcass)
    
    # Upper Carcasses (2 modules, smaller depth, hung higher)
    upper_w = 0.9
    upper_h = 0.72
    upper_d = 0.32
    upper_z = plinth_h + cab_h + 0.6 + upper_h / 2  # 60cm gap above countertop
    create_box_mesh("Frame_Cabinet_Upper_1", upper_w, upper_h, upper_d, -upper_w / 2 - 0.1, 0.2, upper_z, mat_carcass)
    create_box_mesh("Frame_Cabinet_Upper_2", upper_w, upper_h, upper_d, upper_w / 2 + 0.1, 0.2, upper_z, mat_carcass)
    
    # --- 2. COUNTERTOP & BACKSPLASH (Countertop_*) ---
    # Countertop (Covers all 3 lower modules)
    countertop_thickness = 0.04
    ct_z = plinth_h + cab_h + countertop_thickness / 2
    create_box_mesh("Countertop_Main", cab_w * 3 + 0.02, countertop_thickness, cab_d + 0.02, 0, -0.01, ct_z, mat_countertop)
    
    # Sink cutout / representation on left module
    create_box_mesh("Countertop_Sink", 0.45, 0.01, 0.4, -cab_w, -0.01, ct_z + 0.021, mat_appliances)
    
    # Backsplash board
    create_box_mesh("Countertop_Backsplash", cab_w * 3, 0.6, 0.02, 0, cab_d / 2 - 0.01, plinth_h + cab_h + 0.3, mat_backsplash)
    
    # --- 3. FACADES (Facades_*) ---
    # Door thick = 0.02
    door_thick = 0.02
    door_gap = 0.002
    
    # Left lower module has 2 doors:
    # Facades_Door_Lower_1 (Left hinge)
    create_box_mesh("Facades_Door_Lower_1", cab_w / 2 - door_gap, cab_h - door_gap, door_thick,
                    -cab_w - cab_w / 2, -cab_d / 2 - door_thick, plinth_h, mat_facade, pivot_mode='hinge_l')
    # Facades_Door_Lower_2 (Right hinge)
    create_box_mesh("Facades_Door_Lower_2", cab_w / 2 - door_gap, cab_h - door_gap, door_thick,
                    -cab_w + cab_w / 2, -cab_d / 2 - door_thick, plinth_h, mat_facade, pivot_mode='hinge_r')
                    
    # Middle lower module has 2 drawers (drawer sliding along Z):
    # Facades_Drawer_1 (Upper Drawer)
    create_box_mesh("Facades_Drawer_1", cab_w - door_gap, cab_h / 2 - door_gap, door_thick,
                    0, -cab_d / 2 - door_thick, plinth_h + cab_h / 2, mat_facade, pivot_mode='drawer')
    # Facades_Drawer_2 (Lower Drawer)
    create_box_mesh("Facades_Drawer_2", cab_w - door_gap, cab_h / 2 - door_gap, door_thick,
                    0, -cab_d / 2 - door_thick, plinth_h, mat_facade, pivot_mode='drawer')
                    
    # Upper left cabinet doors:
    # Facades_Door_Upper_1 (Left hinge)
    create_box_mesh("Facades_Door_Upper_1", upper_w / 2 - door_gap, upper_h - door_gap, door_thick,
                    -upper_w / 2 - 0.1 - upper_w / 2, 0.2 - upper_d / 2 - door_thick, upper_z - upper_h / 2, mat_facade, pivot_mode='hinge_l')
    # Facades_Door_Upper_2 (Right hinge)
    create_box_mesh("Facades_Door_Upper_2", upper_w / 2 - door_gap, upper_h - door_gap, door_thick,
                    -upper_w / 2 - 0.1 + upper_w / 2, 0.2 - upper_d / 2 - door_thick, upper_z - upper_h / 2, mat_facade, pivot_mode='hinge_r')
                    
    # Upper right cabinet doors:
    # Facades_Door_Upper_3 (Left hinge)
    create_box_mesh("Facades_Door_Upper_3", upper_w / 2 - door_gap, upper_h - door_gap, door_thick,
                    upper_w / 2 + 0.1 - upper_w / 2, 0.2 - upper_d / 2 - door_thick, upper_z - upper_h / 2, mat_facade, pivot_mode='hinge_l')
    # Facades_Door_Upper_4 (Right hinge)
    create_box_mesh("Facades_Door_Upper_4", upper_w / 2 - door_gap, upper_h - door_gap, door_thick,
                    upper_w / 2 + 0.1 + upper_w / 2, 0.2 - upper_d / 2 - door_thick, upper_z - upper_h / 2, mat_facade, pivot_mode='hinge_r')
                    
    # --- 4. APPLIANCES (Appliances_*) ---
    # Oven in right cabinet
    create_box_mesh("Appliances_Oven", cab_w - 0.04, cab_h - 0.04, cab_d - 0.02, 
                    cab_w, -0.01, plinth_h + cab_h / 2, mat_appliances)
    
    # Cooktop on countertop
    create_box_mesh("Appliances_Cooktop", 0.6, 0.01, 0.5, 
                    cab_w, -0.01, ct_z + countertop_thickness / 2 + 0.006, mat_appliances)
                    
    # Save target directory and export
    target_dir = os.path.join("public", "models")
    os.makedirs(target_dir, exist_ok=True)
    glb_path = os.path.join(target_dir, "kitchen_scene.glb")
    
    # Export scene
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        export_apply=True,
        export_colors=True
    )
    print(f"Exported successfully to {glb_path}")

if __name__ == "__main__":
    build_assembly_kitchen()
